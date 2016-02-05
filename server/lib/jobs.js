var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	hasProp = {}.hasOwnProperty;

AnalyzeAlgorithmJob = (function(superClass) {
	extend(AnalyzeAlgorithmJob, superClass);

	function AnalyzeAlgorithmJob() {
		return AnalyzeAlgorithmJob.__super__.constructor.apply(this, arguments);
	}

	AnalyzeAlgorithmJob.prototype.handleJob = function() {
		var future = new Future();

		var algorithmId = this.params.algorithmId;

		var algorithm = Algorithms.findOne(algorithmId);
		if (!algorithm) {
			throw new Error("Algorithm not found!");
		}

		// Run the algorithm
		console.log('Algorithm ' + algorithm._id + ' - run started ');

		var tick = function(board, run, ticksCount, hasError, errorType) {
			// Check for end run condition
			if (hasError || board.hasLost || ticksCount >= MAX_ALGORITHM_TICKS) {
				run.hasError = hasError;
				run.errorType = errorType || null;
				run.hitLimit = ticksCount >= MAX_ALGORITHM_TICKS;
				run.score = board.score;
				run.ticksCount = ticksCount;

				// Add run to algorithm
				console.log('Algorithm ' + algorithm._id + ' - run finished ');
				Algorithms.update(algorithmId, {$addToSet: {runs: run}});
				future.return();
			}
			else {
				// Process run
				var algorithmCode = Utils.decorateAlgorithm(algorithm.code, board);

				var sandbox = new Sandbox();
				sandbox.options.timeout = 30000;
				sandbox.run(algorithmCode, Meteor.bindEnvironment(function(output) {
					var direction = Utils.parseDirection(output.result);

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
					tick(board, run, ticksCount, hasError, errorType);
				}));
			}
		}

		// Start initial tick
		var newBoard = new Threes.Board();

		var newRun = {
			score: 0,
			hasError: false,
			hitLimit: false,
			snapshots: []
		};

		// newRun.snapshots.push({
		// 	step: 0,
		// 	board: Utils.copyBoard(newBoard),
		// 	directionMoved: null
		// });

		tick(newBoard, newRun, 0, false);

		return future.wait();
	};

	return AnalyzeAlgorithmJob;

})(Job);
