_ = lodash
Future = Npm.require('fibers/future');
Sandbox = Meteor.npmRequire('sandbox');

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

		var algorithmCode = Utils.decorateAlgorithm(algorithm.code, board);

		var sandbox = new Sandbox();
		sandbox.run(algorithmCode, function(output) {
			var direction = Utils.parseDirection(output.result);

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

		// Clear out old analyses
		Analyses.remove({algorithm_id: algorithmId});

		// Create new analysis
		var analysisId = Analyses.insert({
			algorithm_id: algorithmId,
			runs: []
		});

		// Schedule analysis job
		_.times(ALGORITHM_RUNS, function() {
			Job.push(new AnalyzeAlgorithmJob({analysisId: analysisId}));
		});

		return analysisId;
	}
});
