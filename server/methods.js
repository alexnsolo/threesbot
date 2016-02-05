_ = lodash
Future = Npm.require('fibers/future');

var copyBoard = function(board) {
	return _.cloneDeep({
		tiles: board.tiles,
		next: board.nextTile
	});
}

Meteor.methods({
	'Algorithm.test': function(code, tiles, nextTile) {
		if (_.isEmpty(code)) {
			throw new Meteor.Error('validation', 'Algorithm must have code!');
		}

		if (code.length > MAX_CODE_LENGTH) {
			throw new Meteor.Error('validation', 'Too much code!');
		}

		var future = new Future();

		var board = new Threes.Board();
		board.tiles = tiles;
		board.nextTile = nextTile;

		var code = Utils.decorateAlgorithm(code, board);

		var sandbox = new Sandbox();
		sandbox.run(code, function(output) {
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

	'Algorithm.analyze': function(code) {
		if (_.isEmpty(code)) {
			throw new Meteor.Error('validation', 'Algorithm must have code!');
		}

		if (code.length > MAX_CODE_LENGTH) {
			throw new Meteor.Error('validation', 'Too much code!');
		}

		// Create algorithm
		algorithmId = Algorithms.insert({
			code: code,
			runs: []
		});

		// Schedule analysis job
		_.times(ALGORITHM_RUNS, function() {
			Job.push(new AnalyzeAlgorithmJob({algorithmId: algorithmId}));
		});

		return algorithmId;
	}
});
