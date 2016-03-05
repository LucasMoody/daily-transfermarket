var seneca = require('seneca')();
var Q = require('q');
var	comunio = require('../comunio.js');

module.exports = function comunio(options) {
	this.add('role:comunio,players:get', getComPlayers);
	this.add('role:comunio,playervalue:get', getplayervalue);
}

function getComPlayers(msg, respond) {
	seneca.client(10102).act('role:database,clubs:get', function(err, clubs) {
		if(err) console.error(err);
		var clubIds = [];
		clubs.forEach(function(club) {
			clubIds.push(club.comclubid);
		});
		clubIds.reduce(function(sofar, f) {
			return sofar.then(function(array) {
				return comunio.getPlayersByClubId(f).then(function(players) {
					return array.concat(players);
				});
			});
		}, Q.fcall(function() {
			return [];
		}))
			.then(function(allPlayers) {
				respond(null, allPlayers);
			}).catch(function(err) {
				respond(err);
			});
		/*var promises = clubIds.map(function(clubId) {
			return comunio.getPlayersByClubId(clubId);
		});
		//var promises = [comunio.getPlayersByClubId(1),comunio.getPlayersByClubId(5)]
		Q.all(promises)
		.then(function(result) {
			respond(result.reduce(function(a,b) {
				return a.concat(b);
			}));
		})
		.catch(function(err) {

		});*/
	});
}

function getplayervalue(msg, respond) {
	if(!msg.data)
		return respond(new Error('data property must be defined and it should contain the player id and the date of which you want to know the player value'));
	var playerId = msg.data.playerId;
	if(!playerId)
		return respond(new Error('Please specify the playerId property in the data property of the message'));
	if(isNan(playerId))
		return respond(new Error('playerId should be a number'));
	var date = msg.data.date;
	if(!date)
		return respond(new Error('Please specify the date property in the data property of the message'));
	//comunio.
}