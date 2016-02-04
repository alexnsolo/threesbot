_ = lodash;

angular.module('threes-bot', [
	'angular-meteor'
]);

angular.module('threes-bot').run(function() {
	console.log('Threes Bot initialized.');
});

angular.module('threes-bot').controller('BoardCtrl', function($scope) {
	$scope.board = new Threes.Board();
	console.log($scope.board);

	$scope.canMove = function(direction) {
		return $scope.board.isMoveValid(direction);
	};

	$scope.doMove = function(direction) {
		if ($scope.canMove(direction)) {
			$scope.board.moveInDirection(direction);
		}
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
