var seneca = require('seneca')(),
	comunio = require('add-market-values');
var dbApi = seneca.client(10102);

module.exports = function comunio(options) {
	this.add('role:comunio,players:get', getTransferMarket);
}

function getTransferMarket(msg, respond) {
	if(!msg.data)
		return respond(new Error('data property must be defined and it should contain the player id and the date of which you want to know the player value'));
	var comunioId = msg.data.comunioId;
	if(!playerId)
		return respond(new Error('Please specify the comunioId property in the data property of the message'));
	if(isNan(playerId))
		return respond(new Error('comunioId property should be a number'));
	var days = msg.data.days;
	if(!date)
		return respond(new Error('Please specify the days property in the data property of the message'));
	if(isNan(days))
		return respond(new Error('days property should be a number'));
	var onlyComPlayer = msg.data.com;
	if(!onlyComPlayer)
		return respond(new Error('Please specify the com property in the data property of the message'));
	if(onlyComPlayer !== 'true' && onlyComPlayer !== 'false' ) {
		return respond(new Error('com property should be either true or false'));
	}
	comunio.getCommunityMarket(comunioId)
		.then(function(players) {
			var promises = [];
			if(com == 'true') {
				players = players.filter(function(val) {
					return val.ownerid == '1' ? true : false;
				});
			}
			players.forEach(function(val) {
				var deferred = Q.defer();
				dbApi.act({ role:"database", player:"convertPlayerId", data: { comPlayerId:  val.id } }, function(err, res) {
					if(err)
						return deferred.reject(err);
					return deferred.resolve(res);
				});
				promises.push(deferred.promise.then(function(playerId) {
					var deferred = Q.defer();
					dbApi.act({ role:"database", playerValues:"get", data: { playerId: playerId, days: days } }, function(err, res) {
						if(err) return deferred.reject(err);
						val["quotes"] = res;
						return deferred.resolve(val);
					});
					return deferred.promise;
				}));
			});
			return Q.allSettled(promises);
		})
		.then(function(res) {
			res.filter(function(val) {
				return val.state === "fulfilled";
			}).map(function(val) {
				return val.value;
			})
		});
}