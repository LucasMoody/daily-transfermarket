var comunio = require('./comunio.js'),
	Q = require('q'),
	express = require('express'),
	app = express();
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

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

});