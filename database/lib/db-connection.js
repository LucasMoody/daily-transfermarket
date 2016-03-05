"use strict";

var	models = require('../models.js'),
    Q = require('q'),
    moment = require('moment');

function addNews (news) {
    return getPlayers()
        .then(players => {
            //map news to player with name id map
            var playerNames = {}, promises = [];
            players.forEach(function(player) {
                playerNames[player.name] = player.id;
            });
            //map news to player id
            news.forEach(function(newsObj, idx) {
                newsObj.categories.forEach(function(category) {
                    //map category to player id
                    //first separate name parts of the category because news
                    //name and comunio name are not the same
                    var nameparts = category.split(/[ (, )]/);

                    if(nameparts.length == 0) return;

                    var lastName = nameparts[0];
                    for (var name in playerNames) {
                        if (playerNames.hasOwnProperty(name) && name.indexOf(lastName) != -1) {
                            //check whether player name in db has also a first name abbreviation
                            var parts = name.split(/\w+\. /);
                            if(parts > 1) {

                            } else {

                            }
                            //add to db
                            promises.push(models.PlayerNews.findOrCreate({ where: { link: newsObj.link, headline: newsObj.title, newstext: newsObj.description, newsdate: newsObj.pubDate, pid: playerNames[name] } }));
                        }
                    }
                    /*category.split(/[ (, )]/).some(function(namePart) {
                     //check whether name part is contained in any comunio player name
                     for (var name in playerNames) {
                     if (playerNames.hasOwnProperty(name) && name.indexOf(namePart) != -1) {
                     //add to db
                     promises.push(models.PlayerNews.findOrCreate({ where: { link: newsObj.link, headline: newsObj.title, newstext: newsObj.description, newsdate: newsObj.pubDate, pid: playerNames[name] } }));
                     return true;
                     }
                     }
                     return false;
                     });*/
                });
            });
            Q.all(promises)
                .then(function() {
                    respond(null, {success: true});
                })
                .catch(function(err) {
                    respond(new Error('News adding was unsuccessful'));
                });
        });
}

/**
 * @typedef News
 * @type Object
 * @param {number} id - news's id in the database
 * @param {string} link - news's link
 * @param {string} headline - news's headline
 * @param {date} newsdate - news's publication date
 * @param {number} pid - football player's id to the corresponding news
 */


/**
 * Gets all news for a given football player who is identified by his id in the database.
 * @param {number} playerId - football player's id in the database
 * @returns {*|Promise.<News>} A promise of all news of the given player
 */
function getNews(playerId) {
    var newsModel = models.PlayerNews;
    return newsModel.findAll({
        where: {
            pid: playerId
        }
    }).then(function(news) {
        return news.map(val => val.toJSON());
    });
}

/**
 * @typedef Player
 * @type Object
 * @property {number} id id of the football player in the database
 * @property {number} complayerid id of the football player in comunio
 * @property {string} name name of the football player
 * @property {string} position position of the football player (either keeper, defender, midfielder or striker)
 * @property {number} clubid football player's club id
 */

/**
 * @typedef Club
 * @type Object
 * @property {number} id football club's id
 * @property {string} clubname football club's name
 * @property {number} comclubid football club's comunio id
 */

/**
 * @returns {*|Promise.<Player[]>} A promise of all football players in the database.
 */
function getPlayers () {
    const playerModel = models.Players;
    return playerModel.findAll()
        .then(players =>players.map(player => player.toJSON()));
}

/**
 *
 * @returns {*|Promise.<Club>} A promise of all football clubs in the database
 */
function getClubs () {
    const clubsModel = models.Clubs;
    return clubsModel.findAll().then(clubs => clubs.map(val => val.toJSON()));
}

/**
 * @typedef MarketValue
 * @type Object
 * @param {pid} pid - football player's id of the corresponding market value
 * @param {number} value - football player's market value
 * @param {number} valdate - date of the football player's market value
 */

/**
 * Returns the market values for a given player who is represented by his id in the database
 * @param {number} playerId football players's id in the database
 * @param {number} noOfDays number of days the market values should contain
 * @returns {*|Promise.<MarketValue[]>} A promise of the last noOfDays market values of a given football player
 */
function getPlayerValues (playerId, noOfDays) {
    const marketValueModel = models.MarketValues;
    return marketValueModel.findAll({ where: { pid: playerId }, attributes: ['pid', 'value', 'valdate'], order: [['valdate', 'DESC']], limit: noOfDays })
        .then(res => res.sort((valA, valB) => (valA.valdate > valB.valdate) - (valA.valdate < valB.valdate)).map(val => val.toJSON()));
}

/**
 * Returns the market values for all players in the database
 * @returns {*|Promise.<MarketValue>} A promise of the last noOfDays market values of all football players
 */
function getAllPlayerValues () {
    const marketValueModel = models.MarketValues;
    return marketValueModel.findAll({ attributes: ['pid', 'value', 'valdate'], order: [['valdate', 'DESC']] })
        .then(res => res.sort((valA, valB) => valA.pid == valB.pid ? (valA.valdate > valB.valdate) - (valA.valdate < valB.valdate) : valA.pid - valB.pid).map(val => val.toJSON()));
}

/**
 * Adds market values of a given football player to the current used database.
 * @param {number} playerId The football player's id in the database. The market values will be added for this player.
 * @param {Object[]} values The market values which should be added to the database for the given football player
 * @param {number} values[].quote football player's market value
 * @param {string} values[].valdate date of the football player's market value. The date string format should be YYYY-MM-DD
 * @returns {*|Promise.<{status: "OK" }>} A promise of a status code object
 */
function addPlayerValues (playerId, values) {
    if(isNaN(playerId))
        return Promise.reject(new Error("playerId"))
    const dbPromises = [];
    values.forEach(value => {
        const date = moment(value.valdate, "YYYY-MM-DD").toDate();
        if (isNaN(date.getTime()))
            return dbPromises.push(
                Promise.reject(new Error("Invalid date for: " + value.valdate + ". The date should be in the YYYY-MM-DD format"))
            );
        else if (isNaN(value.quote))
            return dbPromises.push(
                Promise.reject(new Error("quote is: '" + value.quote + "' which is not a number:"))
            );
        else dbPromises.push(
            models.MarketValues.findOrCreate(
                { where: { pid: playerId, value: value.quote, valdate: moment(value.valdate, "YYYY-MM-DD").toDate() } }
            ));
    });
    return Q.all(dbPromises).then(() => { status: "OK" });
}

/**
 * Looks up the football player's id in the database for a given football player's comunio id.
 * @param {number} comPlayerId football player's comunio id
 * @returns {*|Promise.<number>} A promise of a football player's id in the database which corresponds to the football player's comunio id
 */
function lookUpPlayerId (comPlayerId) {
    const playerModel = models.Players;
    return playerModel.findOne({ where: { complayerid: comPlayerId }, attributes: ['id'] }).then(res => res.toJSON());
}

module.exports = {
    addNews,
    getNews,
    getPlayers,
    getClubs,
    getPlayerValues,
    getAllPlayerValues,
    addPlayerValues,
    lookUpPlayerId
}