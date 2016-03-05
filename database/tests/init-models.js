/*var	Q = require('q'),
	Clubs,
	Players;
var Sequelize = require('sequelize'),
    dbConfig = require('../db-config.js');
dbConfig.database = 'comunio_test';
var sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
	dialect: dbConfig.dialect,
	host: dbConfig.host,
	port: dbConfig.port,
	logging: dbConfig.logging
});

before(function() {
	return sequelize.transaction(function(t) {
		var options = { raw: true, transaction: t }

		return sequelize
			.query('SET FOREIGN_KEY_CHECKS = 0', options)
			.then(function() {
				return sequelize.query('truncate table playernews', options)
			})
			.then(function() {
				return sequelize.query('truncate table clubs', options)
			})
			.then(function() {
				return sequelize.query('truncate table players', options)
			})
			.then(function() {
				return sequelize.query('SET FOREIGN_KEY_CHECKS = 1', options)
			});
	}).then(function() {
		var models = require('../models.js');
		Clubs = models.Clubs;
		Players = models.Players;
		return models.functions.sync()
		.then(function(models) {

			return initClubs()
			.then(function() {
				return initPlayers();
			});
		});
	}).catch(function(err) {
		console.error(err);
	});
});

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
	var promises = [];
	promises.push(Players.findOrCreate({ where: { complayerid: 32480, name: 'Douglas Costa', position: 'midfielder', clubid: 1} }));
	return Q.all(promises);
}*/