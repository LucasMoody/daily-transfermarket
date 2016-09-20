const dbConfig = require("../db-config.js");
// switch to test database
dbConfig.database = "comunio_test";
const Sequelize = require('sequelize');
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    dialect: dbConfig.dialect,
    host: dbConfig.host,
    port: dbConfig.port,
    logging: dbConfig.logging
});

/**
 * Clears the database. That means it truncates playernews, clubs and players tables.
 * @returns {*|Promise.<Array.<Object>>} Promise of with two results where the first element in the array is an array of results and the second one is a metadata object containing the number of effected rows. Use spread to access the result.
 */
function clearDatabase() {
    return sequelize.transaction(t => {
        const options = { raw: true, transaction: t }
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
    });
}

function initModels() {
    const models = require('../models.js');
    return models.functions.sync()
        .then(() => initClubs(models.Clubs))
        .then(() => initPlayers(models.Players))
        .then(() => initMatches(models.GameSchedule));
}

function initClubs(Clubs) {
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
    return Promise.all(promises);
}

function initPlayers(Players) {
    const promises = [];
    const dummyJsonData = require('./player-dummy-data.json');
    dummyJsonData.forEach(player => {
       promises.push(
         Players.findOrCreate({ where: {
             id: player.id,
             complayerid: player.complayerid,
             name: player.name,
             position: player.position,
             clubid: player.clubid
         } })
       );
    });
    return Promise.all(promises);
}

function initMatches(GameSchedule) {
    const promises = [];
    const dummyJsonData = require('./match-dummy-data.json');
    dummyJsonData.forEach(match => {
        promises.push(
            GameSchedule.findOrCreate({ where: {
                gameday: match.gameDay,
                seasonstart: match.seasonStart,
                homescore: match.homeScore,
                guestscore: match.guestScore,
                homeclubid: match.homeTeam,
                guestclubid: match.guestTeam
            } })
        );
    });
    return Promise.all(promises);
}

module.exports = {
    clearDatabase,
    initModels
}