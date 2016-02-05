_ = lodash;

angular.module('threes-bot', [
	'angular-meteor'
]);

angular.module('threes-bot').run(function() {
	console.log('Threes Bot initialized.');
});

angular.module('threes-bot').controller('BoardCtrl', function($scope, $meteor) {
	$scope.board = new Threes.Board();
	$scope.algorithm = "";

	$scope.makeMove = function() {
		$scope.error = false;

		$meteor.call('Algorithm.execute', $scope.board.tiles, $scope.board.nextTile, $scope.algorithm)
			.then(function(direction) {
				if (direction != 'ERROR' && $scope.board.isMoveValid(direction)) {
					$scope.board.moveInDirection(direction);
				}
				else {
					$scope.error = true;
				}
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

});
