var LEFT = "LEFT";
var RIGHT = "RIGHT";
var UP = "UP";
var DOWN = "DOWN";

function Board() {
	var self = this;

	self.tiles = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
	self.nextTile = null;
	self.deck = [];
	self.hasLost = false;
	self.score = 0;

	// Populate initial tiles
	var locs = [];
	_.times(9, function() {
		var row = Math.floor(Math.random() * 4);
		var col = Math.floor(Math.random() * 4)
		if (!_.filter(locs, {row: row, col: col}).length) {
			locs.push({row: row, col: col});
		}
	});

	_.each(locs, function(l) {
		self.tiles[l.row][l.col] = self._pickNextTile();
	});

	// Set next tile
	self.nextTile = this._pickNextTile();
}

Board.prototype._pickNextTile = function() {
	var self = this;

	// Bonus draw
	var bonus = _.some(_.flatten(self.tiles), function(t) {return (t >= 48);} )
	if (bonus && (Math.random() <= 1/21)) {
		var highest = _.max(_.flatten(self.tiles));
		var size = Math.log(highest / 3) / Math.log(2) - 3;
		var bonus_deck = _(size).times(function(n) {
			return 6 * Math.pow(2, n);
		});

		var tile = _.sample(bonus_deck);
		return tile;
	}

	// Normal draw
	if (_.isEmpty(self.deck)) {
		self.deck = _.shuffle([1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3]);
	}

	var tile = self.deck.shift();

	return tile;
};

Board.prototype._moveTiles = function(tiles, direction) {
	var moved = [];

	var attemptTileMove = function(i, j, i_pr, j_pr) {
		// Empty space
		if (tiles[i][j] === 0) {
			return;
		}

		// Twins
		if (tiles[i][j] === tiles[i_pr][j_pr]) {
			// Not actually twins
			if (tiles[i][j] === 1 || tiles[i][j] === 2) {
				return;
			}

			// Okay actually twins
			tiles[i][j] = 0;
			tiles[i_pr][j_pr] *= 2;
			moved.push({i: i, j: j, t: tiles[i_pr][j_pr]});
		}

		// Not twins
		else {
			// Move to empty space
			if (tiles[i_pr][j_pr] === 0) {
				tiles[i_pr][j_pr] = tiles[i][j];
				tiles[i][j] = 0;
				moved.push({i: i, j: j, t: tiles[i_pr][j_pr]});
			}

			// 1 + 2 = 3
			else if ((tiles[i][j] === 1 && tiles[i_pr][j_pr] === 2) ||
							 (tiles[i][j] === 2 && tiles[i_pr][j_pr] === 1)) {
				tiles[i_pr][j_pr] = 3;
				tiles[i][j] = 0;
				moved.push({i: i, j: j, t: tiles[i_pr][j_pr]});
			}
		}
	}

	switch(direction) {
		case LEFT:
			for (var i = 0; i <= 3; i++) {
				for (var j = 0; j <= 3; j++) {
					if (j === 0) {
						continue;
					}
					attemptTileMove(i, j, i, j - 1);
				}
			}
			break;

		case RIGHT:
			for (var i = 0; i <= 3; i++) {
				for (var j = 3; j >= 0; j--) {
					if (j === 3) {
						continue;
					}
					attemptTileMove(i, j, i, j + 1);
				}
			}
			break;

		case UP:
			for (var j = 0; j <= 3; j++) {
				for (var i = 0; i <= 3; i++) {
					if (i === 0) {
						continue;
					}
					attemptTileMove(i, j, i - 1, j);
				}
			}
			break;

		case DOWN:
			for (var j = 0; j <= 3; j++) {
				for (var i = 3; i >= 0; i--) {
					if (i === 3) {
						continue;
					}
					attemptTileMove(i, j, i + 1, j);
				}
			}
			break;
	}

	return moved;
};

Board.prototype._insertNewTile = function(movedTiles, direction) {
	var self = this;
	var locs = [];

	switch(direction) {
		case LEFT: // Right column
			var j = 3;
			var rows = _.uniq(_.map(movedTiles, "i"));

			_.each(rows, function(i) {
				if (self.tiles[i][j] === 0) {
					locs.push({i: i, j: j});
				}
			});
			break;

		case RIGHT: // Left column
			var j = 0;
			var rows = _.uniq(_.map(movedTiles, "i"));

			_.each(rows, function(i) {
				if (self.tiles[i][j] === 0) {
					locs.push({i: i, j: j});
				}
			});
			break;

		case UP: // Bottom column
			var i = 3;
			var cols = _.uniq(_.map(movedTiles, "j"));

			_.each(cols, function(j) {
				if (self.tiles[i][j] === 0) {
					locs.push({i: i, j: j});
				}
			});
			break;

		case DOWN: // Top column
			var i = 0;
			var cols = _.uniq(_.map(movedTiles, "j"));

			_.each(cols, function(j) {
				if (self.tiles[i][j] === 0) {
					locs.push({i: i, j: j});
				}
			});
			break;
	}

	return _.sample(locs);
};

Board.prototype._calculateScore = function() {
	var self = this;

	var score_tile = function(t) {
		score = Math.pow(3, (Math.log(t / 3) / Math.log(2) + 1));
		return Math.floor(score);
	}

	var total = _.reduce(_.flatten(self.tiles), function(acc, t) {
		return acc + ((t != 1 && t != 2) ? score_tile(t) : 0);
	}, 0);

	return total;
};

Board.prototype.isMoveValid = function(direction) {
	var self = this;

	var tiles = _.cloneDeep(self.tiles);
	var movedTiles = self._moveTiles(tiles, direction);

	return movedTiles.length > 0;
};

Board.prototype.getValidMoves = function() {
	var self = this;
	var moves = [];

	if (self.isMoveValid(LEFT)) {
		moves.push(LEFT);
	}
	if (self.isMoveValid(RIGHT)) {
		moves.push(RIGHT);
	}
	if (self.isMoveValid(UP)) {
		moves.push(UP);
	}
	if (self.isMoveValid(DOWN)) {
		moves.push(DOWN);
	}

	return moves;
}

Board.prototype.moveInDirection = function(direction) {
	var self = this;

	// Figure out which tiles would move
	var tiles = _.cloneDeep(self.tiles);
	var movedTiles = self._moveTiles(tiles, direction);

	if (movedTiles.length === 0) {
		throw new Error("Cannot move in that direction!");
	}

	// Update tiles
	self.tiles = tiles;

	// Add the next tile to the board
	var nextLocation = self._insertNewTile(movedTiles, direction);
	self.tiles[nextLocation.i][nextLocation.j] = self.nextTile;

	// Check for empty spaces
	var tileList = _.flatten(self.tiles);
	var hasEmptySpaces = _.some(tileList, function(tile) {
		return tile === 0;
	});

	// Check for moves in every direction
	var canMove = _.some([LEFT, RIGHT, UP, DOWN], function(direction) {
		return self.isMoveValid(direction);
	});

	// If another move can be made, set next tile
	// Otherwise mark as game lost
	if (hasEmptySpaces || canMove) {
		self.nextTile = this._pickNextTile();
	}
	else {
		self.hasLost = true;
	}

	// Update score
	self.score = self._calculateScore();

	return self;
};

Threes = {
	Board: Board
};
