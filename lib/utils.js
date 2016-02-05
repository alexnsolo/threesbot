Utils = {
	decorateAlgorithm: function(algorithmCode, board) {
		return "var BOARD = " + JSON.stringify(board.tiles) + ";"
				 + "var NEXT = " + board.nextTile + ";"
				 + "var VALID_MOVES = " + JSON.stringify(board.getValidMoves()) + ";"
				 + "var RANDOM_NUMBER = " + Math.random() + ";"
				 + "var RANDOM_MOVE = " + JSON.stringify(_.sample(board.getValidMoves())) + ";"
				 + algorithmCode;
	},

	parseDirection: function(result) {
		return result.replace(/'/g, "");
	}
};
