var BASE_DECK = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3];

function Board() {
	var self = this;

	self.tiles = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
	self.next = null;
	self.deck = [];

	var locs = [];
	_.times(9, function() {
		var row = Math.floor(Math.random() * 4);
		var col = Math.floor(Math.random() * 4)
		if (!_.where(locs, {row: row, col: col}).length) {
			locs.push({row: row, col: col});
		}
	});

	_.each(locs, function(l) {
		self.tiles[l.row][l.col] = self.pickNextTile();
	});

	self.next = this.pickNextTile();
}

Board.prototype.pickNextTile = function() {
	var self = this;

	// Bonus draw
	var bonus = _.some(_.flatten(self.tiles), function(t) {return (t >= 48);} )
	if (bonus && (Math.random() <= 1/21)) {
		var highest = _.max(_.flatten(tiles));
		var size = Math.log(highest / 3) / Math.log(2) - 3;
		var bonus_deck = _(size).times(function(n) {
			return 6 * Math.pow(2, n);
		});

		var tile = _.sample(bonus_deck);
		return tile;
	}

	// Normal draw
	if (_.isEmpty(self.deck)) {
		self.deck = _.shuffle(BASE_DECK);
	}

	var tile = self.deck.shift();

	return tile;
};

Threes = {
	Board: Board
};
