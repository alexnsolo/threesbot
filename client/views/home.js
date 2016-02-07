angular.module('threes-bot').controller('HomeCtrl', function($scope, $meteor, $state, $rootScope) {
	$scope.board = new Threes.Board();
	$scope.showManual = false;
	$scope.lastMove = "-";
	$scope.code = "function chooseMove() {" +
								"\n  return RANDOM_MOVE;" +
								"\n}" +
								"\n" +
								"\nchooseMove();";

	if ($rootScope.copyCode) {
		$scope.code = $rootScope.copyCode;
		$rootScope.copyCode = null;
	}

	$scope.aceLoaded = function(editor) {
		editor.setValue($scope.code);
		editor.session.selection.clearSelection();
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
			.then(function(output) {
				// Log output
				if (!_.isEmpty(output.console)) {
					output.console.forEach(function(message) {
						console.log(message);
					});
				}

				var direction = Utils.parseDirection(output.result);

				if ($scope.board.isMoveValid(direction)) {
					$scope.board.moveInDirection(direction);
					$scope.lastMove = direction;
				}
				else {
					$scope.error = true;
				}
			});
	};

	$scope.analyze = function() {
		$meteor.call('Algorithm.analyze', $scope.code)
			.then(function(algorithmId) {
				$state.go('algorithm', {algorithmId: algorithmId});
			});
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
