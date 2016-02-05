// Define a rule that matches add comment attempts by non-admin users
var testAlgorithmLimit = {
		type: 'method',
		name: 'Algorithm.test'
};

var analyzeAlgorithmLimit = {
		type: 'method',
		name: 'Algorithm.analyze'
};

DDPRateLimiter.addRule(testAlgorithmLimit, 1, 500);
DDPRateLimiter.addRule(analyzeAlgorithmLimit, 1, 5000);
DDPRateLimiter.setErrorMessage(function() {
	return "Please wait and try again in a few seconds.";
});
