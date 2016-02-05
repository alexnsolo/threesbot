_ = lodash;

angular.module('threes-bot', [
	'angular-meteor',
	'ui.router',
	'ui.ace'
]);

angular.module('threes-bot').run(function() {
	console.log('Threes Bot initialized.');
});

angular.module('threes-bot').config(function($urlRouterProvider, $stateProvider, $locationProvider) {
	$locationProvider.html5Mode(true);
	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('home', {
			url: '/',
			templateUrl: 'client/views/home.html',
			controller: 'HomeCtrl'
		})
		.state('algorithm', {
			url: '/a/:algorithmId',
			templateUrl: 'client/views/algorithm.html',
			controller: 'AlgorithmCtrl'
		});
});
