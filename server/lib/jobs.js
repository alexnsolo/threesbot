var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AnalyzeAlgorithmJob = (function(superClass) {
	extend(AnalyzeAlgorithmJob, superClass);

	function AnalyzeAlgorithmJob() {
		return AnalyzeAlgorithmJob.__super__.constructor.apply(this, arguments);
	}

  AnalyzeAlgorithmJob.prototype.handleJob = function() {
		var analysisId = this.params.analysisId;

		var analysis = Analyses.findOne(analysisId);
		if (!analysis) {
			throw new Error("Analysis not found!");
		}

		var algorithm = Algorithms.findOne(analysis.algorithm_id);
		if (!analysis) {
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

				// Add run to analysis
				Analyses.update(analysisId, {$addToSet: {runs: run}});

        console.log('Algorithm ' + algorithm._id + ' - run finished ');
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
			hitLimit: false
			// snapshots: []
		};

    // run.snapshots.push({
    // 	step: 0,
    // 	board: copyBoard(board),
    // 	directionMoved: null
    // });

		tick(newBoard, newRun, 0, false);
	};

	return AnalyzeAlgorithmJob;

})(Job);
