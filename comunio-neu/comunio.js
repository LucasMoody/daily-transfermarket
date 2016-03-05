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
			return { quote : result.return.$value, date : date };
		});
}
function getUserId(userName, callback) {
	var args = {login : userName};
	soap.createClient(url, function(err, client) {
		if(err) {
			callback(err);
		} else {
			client.getuserid(args, function(err, result) {
				if(!result.return || !result.return.$value) {
						callback(new Error('No user id for user: ' + userName));
					} else {
						callback(err, result.return.$value);
					}
			});
		}
	});
}

function substractDaysFromCurrentDate(numDays) {
	return moment().subtract(subtractForDay, "days").format("YYYY-MM-DD");
}

function getMarketValueForPlayer(playerId, numDays, callback) {
	var i, marketValues = [], promises = [], finished = 0, daysArray = [];
	for (i = 1; i<=numDays; i++) {
		promises.push(getMarketValueForPlayerAtDate(playerId, substractDaysFromCurrentDate(i)));
	}
		/*innerFunction = function(subtractForDay) {
			var curDate = moment().subtract(subtractForDay, "days").format("YYYY-MM-DD");
			var deferred = Q.defer();
			getMarketValueForPlayerAtDate(playerId, curDate, function(err, result) {
				if (err) {
					deferred.reject(err);
				} else {
					deferred.resolve(result);
				}
			});
			promises.push(deferred.promise);
		}*/
			

	/*daysArray.forEach(function(val, idx) {
		curDate = moment().subtract(val, "days").format("YYYY-MM-DD");
		var deferred = Q.defer();
		getMarketValueForPlayerAtDate(playerId, curDate, function(err, result) {
			console.log(promises);
			if (err) {
				deferred.reject(err);
			} else {
				deferred.resolve(result);  
			}
		});
		promises.push(deferred.promise);
	});*/
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

	
	// soap.createClient(url, function(err, client) {
	// 		client.getplayersbyclubid(args, function(err, result) {
	// 				var player, attribute, players = [], curPlayer = {};
	// 				for (player in result.return.item) {
	// 					for (attribute in result.return.item[player]) {
	// 						if (result.return.item[player][attribute].$value) {

	// 							curPlayer[attribute] = !isNaN(parseInt(result.return.item[player][attribute].$value)) ? 
	// 								parseInt(result.return.item[player][attribute].$value) : result.return.item[player][attribute].$value;
	// 						}
	// 					}
	// 					curPlayer.date = new Date();
	// 					players.push(curPlayer);
	// 					curPlayer = {};
	// 				}
	// 				callback(players);
	// 		});
	// });
};

function getCommunityMarket(communityId, callback) {
	var args = {name: communityId};
	return Q.nfcall(soap.createClient, url)
		.then(function(client) {
			return Q.nfcall(client.getcommunitymarket, args);
		})
		.then(function(result) {
			var player, attribute, players = [], curPlayer = {};
			for (player in result.return.item) {
				for (attribute in result.return.item[player]) {
					if (result.return.item[player][attribute].$value) {
						curPlayer[attribute] = result.return.item[player][attribute].$value;
					}
				}
				players.push(curPlayer);
				curPlayer = {};
			}
			return players;
		});
};

function getUserGameDayPoints(userId, gameDayId, callback) {
	var args = {userid : userId, gameday : gameDayId};
	soap.createClient(url, function(err, client) {
			client.getuserslineupbygameday(args, function(err, result) {
				console.log(result);
			});
	});
};

function getCommunityName(communityId, callback) {
	var args = {communityid : communityId};
	soap.createClient(url, function(err, client) {
			client.getcommunityname(args, function(err, result) {
				console.log(result);
			});
	});
};

function getCommunityByUser(userName, callback) {
	getUserId(userName, function(err, userId) {
		if(err) {
			callback(err);
		} else {
			var args = {userid : userId};
			soap.createClient(url, function(err, client) {
					if(err) {
						callback(err);
					} else {
						var deferred = [Q.defer(), Q.defer()];
						client.getcommunityid(args, function(err, result) {
							if(!result.return || !result.return.$value) {
								deferred[0].reject(new Error('No community id for user id: ' + userId));
							} else {
								deferred[0].resolve(result.return.$value);
							}
						});
						client.getcommunitynamebyuserid(args, function(err, result) {
							if(!result.return || !result.return.$value) {
								deferred[1].reject(new Error('No community name for user id: ' + userId));
							} else {
								deferred[1].resolve(result.return.$value);
							}
						});
						Q.all([deferred[0].promise,deferred[1].promise]).then(function(results){
							callback(undefined, {id : results[0], name : results[1]});
						}).fail(function(err) {
							callback(err);
						});
					}
			});  
		}
	});
};

function getPlayerGameDayPoints(playerId, gameDayId, callback) {
	var args = {playerid : playerId, gameday : gameDayId};
	soap.createClient(url, function(err, client) {
			client.getplayergamedaypoints(args, function(err, result) {
				console.log(result);
			});
	});
}

function getGameDays(callback) {
	var args = {};
	soap.createClient(url, function(err, client) {
			client.getgamedays(null, function(err, result) {
				console.log(result);
			});
	});
}

exports.module = {
	getGameDays: getGameDays,
	getPlayerGameDayPoints: getPlayerGameDayPoints,
	getCommunityByUser: getCommunityByUser,
	getCommunityName: getCommunityName,
	getUserGameDayPoints: getUserGameDayPoints,
	getCommunityMarket: getCommunityMarket,
	getPlayersByClubId: getPlayersByClubId,
	getMarketValueForPlayer: getMarketValueForPlayer,
	getMarketValueForPlayerAtDate: getMarketValueForPlayerAtDate
}