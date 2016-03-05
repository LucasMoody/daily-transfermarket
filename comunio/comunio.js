var soap = require('soap'),
		Q = require('q'),
		moment = require('moment'),
		url = 'http://www.comunio.de/soapservice.php?wsdl';

function getMarketValueForPlayerAtDate(playerId, date) {
	var args = { playerid: playerId, date:date };
	return Q.nfcall(soap.createClient, url)
		.then(function(client) {
			return Q.nfcall(client.getquote, args);
		})
		.then(function(result) {
			return { quote : result[0].return.$value, date : date };
		});
}
function getUserId(userName) {
	var args = {login : userName};
	return Q.nfcall(soap.createClient, url)
		.then(function(client) {
			return Q.nfcall(client.getuserid, args);
		})
		.then(function(result) {
			if(!result[0].return || !result[0].return.$value) {
				throw new Error('No user id for user: ' + userName);
			} else {
				return result[0].return.$value;
			}
		});
}

function substractDaysFromCurrentDate(numDays) {
	return moment().subtract(numDays, "days").format("YYYY-MM-DD");
}

function getMarketValueForPlayer(playerId, numDays) {
	var i, promises = [];
	for (i = 1; i<=numDays; i++) {
		promises.push(getMarketValueForPlayerAtDate(playerId, substractDaysFromCurrentDate(i)));
	}
	return Q.allSettled(promises).then(function(results) {
		return results.filter(function(val) {
				return val.state === 'fulfilled';
			}).map(function(val) {return val.value;}).sort(function(a,b) {
					return moment(a.date).diff(moment(b.date));
			});
	});
};

function getPlayersByClubId(id, callback) {
	var args = {}
	//check whether id is a string and convert it
	if(id instanceof String) args = {name: id};
	else args = {name: id.toString()};

	return Q.nfcall(soap.createClient, url).then(function(client) {
		return Q.nfcall(client.getplayersbyclubid, args);
	}).then(function(result) {
		var player, attribute, players = [], curPlayer = {};
		//TODO WARNING assumption is that object is in result[0]
		var player, attribute, players = [], curPlayer = {};
		for (player in result[0].return.item) {
			for (attribute in result[0].return.item[player]) {
				if (result[0].return.item[player][attribute].$value) {
					curPlayer[attribute] = result[0].return.item[player][attribute].$value;
				}
			}
			players.push(curPlayer);
			curPlayer = {};
		}
		if (callback != undefined) callback(players);
		return players;
	}).catch(function(err) {
		if (callback == undefined) return err;
		else callback(err);
	});
};

function getCommunityMarket(communityId) {
	var args = {name: communityId};
	return Q.nfcall(soap.createClient, url)
		.then(function(client) {
			return Q.nfcall(client.getcommunitymarket, args);
		})
		.then(function(result) {
			var player, attribute, players = [], curPlayer = {};
			for (player in result[0].return.item) {
				for (attribute in result[0].return.item[player]) {
					if (result[0].return.item[player][attribute].$value) {
						curPlayer[attribute] = result[0].return.item[player][attribute].$value;
					}
				}
				players.push(curPlayer);
				curPlayer = {};
			}
			return players;
		});
};

function getCommunityName(communityId) {
	var args = {communityid : communityId};
	return Q.nfcall(soap.createClient, url)
		.then(function(client) {
			return Q.nfcall(client.getcommunityname, args);
		})
		.then(function(comunityname) {
			return comunityname[0].return.$value;
		});
};

function getCommunityByUser(userName) {
	var args;
	return getUserId(userName)
		.then(function(userId) {
			args = {userid : userId};
			return Q.nfcall(soap.createClient, url);
		})
		.then(function(client) {
			return Q.all([Q.nfcall(client.getcommunityid, args), Q.nfcall(client.getcommunitynamebyuserid, args)]);
		})
		.spread(function(communityId, communityName) {
			if(!communityId[0].return || !communityId[0].return.$value) {
				throw new Error('No community id for user id: ' + args.userId);
			}
			if(!communityName[0].return || !communityName[0].return.$value) {
				throw new Error('No community name for user id: ' + args.userId);
			}
			return {id : communityId[0].return.$value, name : communityName[0].return.$value};
		});
};

module.exports = {
	getCommunityByUser: getCommunityByUser,
	getCommunityName: getCommunityName,
	getCommunityMarket: getCommunityMarket,
	getPlayersByClubId: getPlayersByClubId,
	getMarketValueForPlayer: getMarketValueForPlayer,
	getMarketValueForPlayerAtDate: getMarketValueForPlayerAtDate,
	getUserId: getUserId
}
