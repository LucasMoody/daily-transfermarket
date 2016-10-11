var seneca = require('seneca')(),
	comunio = require('comunio');
var dbApi = seneca.client(10102);

module.exports = function comunio(options) {
	this.add('role:comunio,players:get', getTransferMarket);
}

function getTransferMarket(msg, respond) {
	if(!msg.data)
		return respond(new Error('data property must be defined and it should contain the comunio id and the numberOfDays of the return market values and com for showing only players from the computer'));
	var comunioId = msg.data.comunioId;
	if(!comunioId)
		return respond(new Error('Please specify the comunioId property in the data property of the message'));
	if(isNaN(comunioId))
		return respond(new Error('comunioId property should be a number'));
	var noOfDays = msg.data.noOfDays;
	if(!noOfDays)
		return respond(new Error('Please specify the noOfDays property in the data property of the message'));
	if(isNaN(noOfDays))
		return respond(new Error('noOfDays property should be a number'));
	var onlyComPlayer = msg.data.onlyComputerPlayers;
	if(onlyComPlayer == null || typeof onlyComPlayer !== "boolean")
		return respond(new Error('Parameter onlyComputerPlayers is not specified or is not a boolean'));

	// 1. Who is ony the transfer market?
	comunio.getCommunityMarket(comunioId)
		.then(players => {
			if(onlyComPlayer) {
				return players.filter(function(val) {
					return val.ownerid == '1' ? true : false;
				});
			} else
				return players;
		})
		// 2. What market values does the player have?
		// 2.1 Add playerId from database to data structure
		.then(players => {
			return Promise.all(
				players.map(player => {
					return getPlayerId(player.id)
						.then(playerId => {
							return Object.assign({}, player, {
								dbPlayerId: playerId.id
							});
						});
				})
			);
		})
		// 2.2 add market values
		.then(players => {
			return Promise.all(
				players.map(player => {
					return getPlayerValues(player.dbPlayerId, noOfDays)
						.then(marketValues => {
							return Object.assign({}, player, {
								marketValues
							});
						});
				})
			);
		})
		// 3. Add player stats
		.then(players => {
			return Promise.all(
				players.map(player => {
					return getPlayerStats(player.dbPlayerId, 2015)
						.then(playerStats => {
							return Object.assign({}, player, {
								playerStats
							})
						});
				})
			);
		})
		// 4. respond result
		.then(players => respond(null, players))
		.catch(err => respond(err));
}

function getPlayerValues(playerId, noOfDays) {
	var deferred = Promise.defer();
	dbApi.act({ role:"database", playerValues:"get", data: { playerId: playerId, noOfDays: noOfDays } }, function(err, res) {
		if(err) return deferred.reject(err);
		return deferred.resolve(res);
	});
	return deferred.promise;
}

function getPlayerId(comPlayerId) {
	var deferred = Promise.defer();
	dbApi.act({ role:"database", player:"lookUpPlayerId", data: { comPlayerId:  comPlayerId } }, function(err, res) {
		if(err)
			return deferred.reject(err);
		return deferred.resolve(res);
	});
	return deferred.promise;
}

function getPlayerStats(playerId, seasonStart) {
	var deferred = Promise.defer();
	dbApi.act({ role:"database", playerStats:"get", data: { playerId:  playerId, seasonStart: seasonStart } }, (err, res) => {
		if(err)
			return deferred.reject(err);
		return deferred.resolve(res);
	});
	return deferred.promise;
}