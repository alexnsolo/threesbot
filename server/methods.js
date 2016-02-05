_ = lodash
Future = Npm.require('fibers/future');
Sandbox = Meteor.npmRequire('sandbox');

var ALGORITHM_RUNS = 5;
var MAX_ALGORITHM_TICKS = 1000;

var decorateAlgorithm = function(algorithmCode, board) {
	return "var BOARD = " + JSON.stringify(board.tiles) + ";"
			 + "var NEXT = " + board.nextTile + ";"
			 + "var VALID_MOVES = " + JSON.stringify(board.getValidMoves()) + ";"
			 + "var RANDOM_NUMBER = " + Math.random() + ";"
			 + "var RANDOM_MOVE = " + JSON.stringify(_.sample(board.getValidMoves())) + ";"
			 + algorithmCode;
}

var parseDirection = function(result) {
	return result.replace(/'/g, "");
}

var copyBoard = function(board) {
	return _.cloneDeep({
		tiles: board.tiles,
		next: board.nextTile
	});
}

Meteor.methods({
	'Algorithm.test': function(algorithm, tiles, nextTile) {
		if (_.isEmpty(algorithm.code)) {
			throw new Meteor.Error('validation', 'Algorithm must have code!');
		}

		var future = new Future();

		var board = new Threes.Board();
		board.tiles = tiles;
		board.nextTile = nextTile;

		var algorithmCode = decorateAlgorithm(algorithm.code, board);

		var sandbox = new Sandbox();
		sandbox.run(algorithmCode, function(output) {
			var direction = parseDirection(output.result);

			if (board.isMoveValid(direction)) {
				future.return(direction);
			}
			else {
				future.return(null);
			}
		});

		return future.wait();
	},

	'Algorithm.analyze': function(algorithm) {
		if (_.isEmpty(algorithm.code)) {
			throw new Meteor.Error('validation', 'Algorithm must have code!');
		}

		// Create or update algorithm
		var algorithmId = algorithm._id;
		if (!algorithmId) {
			algorithmId = Algorithms.insert({
				code: algorithm.code
			});
		}

		var algorithm = Algorithms.findOne(algorithmId);
		if (!algorithm) {
			throw new Meteor.Error('not found', 'Algorithm not found!');
		}

		if (_.isEmpty(algorithm.code)) {
			throw new Meteor.Error('validation', 'Algorithm must have code!');
		}

		console.log('Algorithm ' + algorithmId, " - starting --------------------");

		// Clear out old analyses
		Analyses.remove({algorithm_id: algorithmId});

		// Create new analysis
		var analysisId = Analyses.insert({
			algorithm_id: algorithmId,
			runs: [],
			highScore: 0,
			averageScore: 0,
			isProcessing: true
		});

		var updateAnalysis = function() {
			var analysis = Analyses.findOne(analysisId);

			var highest = _.first(_.sortBy(analysis.runs, 'score'));
			var sum = _.reduce(analysis.runs, function(sum, n) {
				return sum + n.score;
			}, 0);

			Analyses.update(analysisId, {$set: {
				highScore: highest.score,
				averageScore: Math.floor(sum / analysis.runs.length)
			}});
		};

		var finishAnalysis = function() {
			Analyses.update(analysisId, {$set: {
				isProcessing: false
			}});
		};

		// Run the algorithm several times
		var doRun = function(runsCount) {
			console.log('Algorithm ' + algorithmId + ' - run started ');

			// run.snapshots.push({
			// 	step: 0,
			// 	board: copyBoard(board),
			// 	directionMoved: null
			// });

			var tick = function(board, run, ticksCount, runsCount, hasError, errorType) {
				// Check for end run condition
				if (hasError || board.hasLost || ticksCount >= MAX_ALGORITHM_TICKS) {
					run.hasError = hasError;
					run.errorType = errorType || null;
					run.hitLimit = ticksCount >= MAX_ALGORITHM_TICKS;
					run.score = board.score;
					run.ticksCount = ticksCount;

					// Add run to analysis
					Analyses.update(analysisId, {$addToSet: {runs: run}});

					// Update high and average score
					updateAnalysis();

					// Finish analysis if done
					if (runsCount >= ALGORITHM_RUNS) {
						finishAnalysis();
					}
					else {
						runsCount++;
						doRun(runsCount);
					}
				}
				else {
					// Process run
					var algorithmCode = decorateAlgorithm(algorithm.code, board);

					var sandbox = new Sandbox();
					sandbox.options.timeout = 30000;
					sandbox.run(algorithmCode, Meteor.bindEnvironment(function(output) {
						var direction = parseDirection(output.result);

						if (board.isMoveValid(direction)) {
							board.moveInDirection(direction);

							// run.snapshots.push({
							// 	step: ticksCount,
							// 	board: copyBoard(board),
							// 	directionMoved: direction
							// });
						}
						else {
							console.log('Run ended in error: ', output);
							hasError = true;

							if (output.result == 'TimeoutError') {
								errorType = 'timeout';
							}
							else {
								errorType = 'invalid';
							}
						}

						// Loop
						ticksCount++;
						tick(board, run, ticksCount, runsCount, hasError, errorType);
					}));
				}
			}

			// Start initial tick
 			var newBoard = new Threes.Board();

			var newRun = {
				score: 0,
				hasError: false,
				hitLimit: false
				// snapshots: []
			};

			tick(newBoard, newRun, 0, runsCount, false);
		}

		doRun(0);

		return analysisId;
	}
});
