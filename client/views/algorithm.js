_ = lodash;

angular.module('threes-bot').controller('AlgorithmCtrl', function($scope, $meteor, $state, $stateParams, $rootScope) {
	$scope.helpers({
		algorithm: () => Algorithms.findOne($stateParams.algorithmId)
	});

	$scope.aceLoaded = function(editor) {
		editor.setValue($scope.algorithm.code);
		editor.setReadOnly(true);
		editor.session.selection.clearSelection();
	};

	$scope.tweet = function() {
		var text = encodeURIComponent("Check out this algorithm to solve the game Threes " + window.location.href);
		window.open("https://twitter.com/intent/tweet?text=" + text, "Twitter", "height=260,width=600");
	};

	$scope.getHighScore = function() {
		var run = _.last(_.sortBy($scope.algorithm.runs, 'score'));
		if (run) {
			return run.score;
		}
		else {
			return "-";
		}
	};

	$scope.getAverageScore = function() {
		if ($scope.algorithm.runs.length > 0) {
			var sum = _.reduce($scope.algorithm.runs, function(sum, run) {
				return sum + run.score;
			}, 0);

			return Math.floor(sum / $scope.algorithm.runs.length);
		}
		else {
			return "-";
		}
	};

	$scope.isPending = function() {
		return $scope.algorithm.runs.length < ALGORITHM_RUNS * 0.8;
	};

	$scope.edit = function() {
		$rootScope.copyCode = $scope.algorithm.code;
		$state.go('home'); // you're drunk
	};
});
