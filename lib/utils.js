_ = lodash;

Utils = {
	decorateAlgorithm: function(algorithmCode, board) {
		return "var BOARD = " + JSON.stringify(board.tiles) + ";"
				 + "var NEXT = " + board.nextTile + ";"
				 + "var VALID_MOVES = " + JSON.stringify(board.getValidMoves()) + ";"
				 + "var RANDOM_NUMBER = " + Math.random() + ";"
				 + "var RANDOM_MOVE = " + JSON.stringify(_.sample(board.getValidMoves())) + ";"
				 + "var FREE_SPACES = " + Threes.Board.prototype.countFreeSpaces(board.tiles) + ";"
				 + "var FREE_SPACES_AFTER_MOVE = " + JSON.stringify(board.countFreeSpacesAfterValidMoves()) + ";"
				 + "var log = console.log;"
				 + algorithmCode;
	},

	parseDirection: function(result) {
		return result.replace(/'/g, "");
	},

	copyBoard: function(board) {
		return _.cloneDeep({
			tiles: board.tiles,
			next: board.nextTile
		});
	}
};
