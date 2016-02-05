angular.module('threes-bot').controller('HomeCtrl', function($scope, $meteor) {
	$scope.board = new Threes.Board();
	$scope.code = "function chooseMove() {" +
								"\n  return RANDOM_MOVE;" +
								"\n}" +
								"\n" +
								"\nchooseMove();";

	$scope.aceLoaded = function(editor) {
		editor.setValue($scope.code);
	};

	$scope.aceChanged = function(event) {
		$scope.code = event[1].getValue();
	};

	$scope.reset = function() {
		$scope.board = new Threes.Board();
	};

	$scope.test = function() {
		$scope.error = false;

		$meteor.call('Algorithm.test', $scope.code, $scope.board.tiles, $scope.board.nextTile)
			.then(function(direction) {
				if (direction != 'ERROR' && $scope.board.isMoveValid(direction)) {
					$scope.board.moveInDirection(direction);
				}
				else {
					$scope.error = true;
				}
			});
	};

	$scope.analyze = function() {
		// $meteor.call('Algorithm.analyze', $scope.code)
		// 	.then(function(algorithmId) {
		// 		$scope.helpers({
		// 	    algorithm: () => Algorithms.findOne(algorithmId)
		// 	  });
		// 	});
	};

	$scope.getTileClass = function(tile) {
		if (tile === 0) {
			return "";
		}
		else if (tile === 1) {
			return "one";
		}
		else if (tile === 2) {
			return "two";
		}
		else {
			return "number";
		}
	};

	$scope.tweet = function() {
		var text = encodeURIComponent("Help Threes Bot solve the game of Threes with a little bit of JavaScript " + window.location.href + " made by @civilframe");
		window.open("https://twitter.com/intent/tweet?text=" + text, "Twitter", "height=260,width=600");
	};
});
