var mongodb = require("./mongodb-connector.js");

exports.insertPlayerNews = function(playerNews, callback) {
	mongodb.insertPlayerNews(playerNews, callback);
}