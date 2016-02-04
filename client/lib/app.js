angular.module('threes-bot', [
	'angular-meteor'
]);

angular.module('threes-bot').run(function() {
	console.log('Threes Bot initialized.');
	console.log(new Threes.Board());
});
