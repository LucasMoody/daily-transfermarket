var dbConnector = require('./db-connector.js'),
	news = require('./news.js');

news.getPlayerNews(function(result) {
	console.log(result);
});