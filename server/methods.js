_ = lodash

Future = Npm.require('fibers/future');

Meteor.methods({
	'Algorithm.execute': function(tiles, nextTile, algorithm) {
		var future = new Future();

		var Sandbox = Meteor.npmRequire('sandbox');
		var s = new Sandbox();

		var board = new Threes.Board();
		board.tiles = tiles;
		board.nextTile = nextTile;

		algorithm = "var TILES = " + JSON.stringify(tiles) + ";"
							+ "var NEXT = " + nextTile + ";"
							+ "var VALID_MOVES = " + JSON.stringify(board.getValidMoves()) + ";"
							+ "var RANDOM = " + Math.random() + ";"
							+ algorithm;

		s.run(algorithm, function(output) {
			console.log(output);
			var direction = output.result.replace(/'/g, "");
			if (board.isMoveValid(direction)) {
				future.return(direction);
			}
			else {
				future.return(null);
			}
		});

		return future.wait();
	}
});
