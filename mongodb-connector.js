var MongoClient = require('mongodb').MongoClient,
// Connection URL
	url = 'mongodb://localhost:27017/comunio';

var insertPlayerNews = function(db, playerNews, callback) {
  // Get the documents collection
  var collection = db.collection('playerNews');
  // Insert some documents
  collection.insert( playerNews, function(err, result) {
    callback(result);
  });
};

exports.insertPlayerNews = function(playerNews, callback) {
	// Use connect method to connect to the Server
  MongoClient.connect(url, function(err, db) {
  	console.log("Connected correctly to server");
  	insertPlayerNews(db, playerNews, function(result) {
      if(callback)
        callback(result);
      db.close();
  	});
  });
};

exports.getPlayerNews = function(playerNames, callback) {
  MongoClient.connect(url, function(err, db) {
    console.log("Connected correctly to server");
    var collection = db.collection('playerNews');
    collection.
    db.close();

    insertPlayerNews(db, playerNews, function(result) {
      if(callback)
        callback(result);
      db.close();
    });
  });
};
