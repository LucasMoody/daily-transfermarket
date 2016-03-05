var comunio = require('./comunio.js'),
	Q = require('q'),
	express = require('express'),
	app = express(),
	news = require('./news.js');
app.get('/comunio/dailytransfermarket', function (req, res) {
	var comunioid = req.query.comunioid,
		days = req.query.days,
		com = req.query.com;
	if (!(comunioid && days && com)) {
		res.sendStatus(400);
		return;
	}
	console.log(req.query);
	comunio.getCommunityMarket(comunioid, function(players) {
		var resultArray = [],
			promises = [];
		if(com == 'true') {
			players = players.filter(function(val) {
				return val.ownerid == '1' ? true : false;
			});
		}
		players.forEach(function(val, idx) {
			var deferred = Q.defer();
			comunio.getMarketValueForPlayer(val.id, days, function(result) {
				val["quotes"] = result;
				deferred.resolve(val);
			});
			promises.push(deferred.promise);
		});
		Q.allSettled(promises).then(function(results){

			res.send(results.map(function(val) {
				return val.value;
			}));
		});
	});
});

app.get('/comunio/getcomunioname', function (req, res) {
	var userName = req.query.username;
	if (!userName) {
		res.sendStatus(400);
		return;
	}
	comunio.getCommunityByUser(userName, function(err, comunioName) {
		if(err) {
			res.status(400).send(err.message);
			return;
		}
		res.send(comunioName);
	});
});

app.get('/comunio/playernews', function (req, res) {
	var playerName = req.query.playername;
	if(!playerName) {
		res.sendStatus(400);
		return;
	}
	news.
});

var server = app.listen(80, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});