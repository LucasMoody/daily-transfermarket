var	Q = require('q'),
	models = require('./models.js'),
	comunio = require('comunio'),
	Clubs,
	Players;

Clubs = models.Clubs;
Players = models.Players;

function initClubs() {
	var promises = [];
	promises.push(Clubs.findOrCreate({ where: { clubname: 'FC Bayern München', comclubid: 1 } }));
	promises.push(Clubs.findOrCreate({ where: { clubname: 'VFL Wolfsburg', comclubid: 12 } }));
	promises.push(Clubs.findOrCreate({ where: { clubname: 'Borussia M\'Gladbach', comclubid: 3 } }));
	promises.push(Clubs.findOrCreate({ where: { clubname: 'Bayer 04 Leverkusen', comclubid: 8 } }));
	promises.push(Clubs.findOrCreate({ where: { clubname: 'FC Augsburg', comclubid: 68 } }));
	promises.push(Clubs.findOrCreate({ where: { clubname: 'FC Schalke 04', comclubid: 10 } }));
	promises.push(Clubs.findOrCreate({ where: { clubname: 'Borussia Dortmund', comclubid: 5 } }));
	promises.push(Clubs.findOrCreate({ where: { clubname: '1899 Hoffenheim', comclubid: 62 } }));
	promises.push(Clubs.findOrCreate({ where: { clubname: 'Eintracht Frankfurt', comclubid: 9 } }));
	promises.push(Clubs.findOrCreate({ where: { clubname: 'SV Werder Bremen', comclubid: 6 } }));
	promises.push(Clubs.findOrCreate({ where: { clubname: '1. FSV Mainz 05', comclubid: 18 } }));
	promises.push(Clubs.findOrCreate({ where: { clubname: '1. FC Köln', comclubid: 13 } }));
	promises.push(Clubs.findOrCreate({ where: { clubname: 'VFB Stuttgart', comclubid: 14 } }));
	promises.push(Clubs.findOrCreate({ where: { clubname: 'Hannover 96', comclubid: 17 } }));
	promises.push(Clubs.findOrCreate({ where: { clubname: 'Hertha BSC Berlin', comclubid: 7 } }));
	promises.push(Clubs.findOrCreate({ where: { clubname: 'Hamburger SV', comclubid: 4 } }));
	promises.push(Clubs.findOrCreate({ where: { clubname: 'FC Ingolstadt 04', comclubid: 90 } }));
	promises.push(Clubs.findOrCreate({ where: { clubname: 'SV Darmstadt 98', comclubid: 89 } }));
	return Q.all(promises);
}
function initPlayers() {
	return Clubs.findAll()
	.then(function(clubs) {
		var clubIdMap = {},
			promises = [];
		clubs.forEach(function(club) {
			clubIdMap[club.comclubid] = club.id;
		});
		clubs.forEach(function(club) {
			promises.push(comunio.getPlayersByClubId(club.comclubid)
				.then(function(players) {
					var savePlayerPromises = [];
					players.forEach(function(player) {
						savePlayerPromises.push(
							Players.findOrCreate({
								where: {
									complayerid: player.id,
									name: player.name,
									position: player.position,
									clubid: clubIdMap[player.clubid]
								}
							}));
					});
					return Q.all(savePlayerPromises)
						.then(function() {
							console.log('Players for club ' + club.clubname + ' were successfully saved in the database');
						})
						.catch(function(err) {
							console.error("Error for club " + club.clubname + ": " + err);
						});
				}));
		});
	});
}

models.functions.sync()
.then(function(){
	return initClubs()
})
.then(function(res) {
	return initPlayers();
});