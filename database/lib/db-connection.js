"use strict";

var	models = require('../models.js'),
    Q = require('q'),
    moment = require('moment');
const playerStatsAttributes = [
    ['pid', 'playerId'],
    'goals',
    'home',
    'cards',
    ['subin', 'subIn'],
    ['subout', 'subOut'],
    'points'
];

const gameScheduleAttributes = [
    'id',
    ['gameday', 'gameDay'],
    ['seasonstart', 'seasonStart'],
    ['homescore', 'homeScore'],
    ['guestscore', 'guestScore'],
    ['homeclubid', 'homeClubId'],
    ['guestclubid', 'guestClubId']
];

const gameScheduleAttributesForPlayerStats = [
    ['gameday', 'gameDay'],
    ['seasonstart', 'seasonStart'],
    ['homescore', 'homeScore'],
    ['guestscore', 'guestScore'],
    ['homeclubid', 'homeClubId'],
    ['guestclubid', 'guestClubId']
];

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

/**
 * This function adds stats for a given player and a given game to the database
 *
 * @param {PlayerStat} playerStat - stat which should be added
 * @returns {*|Promise} - A promise of the database transaction
 */
function addPlayerStats (playerStat) {
    const playerId = playerStat.playerId;
    const gameDay = playerStat.gameDay;
    const seasonStart = playerStat.seasonStart;
    const goals = playerStat.goals;
    const home = playerStat.home;
    const cards = playerStat.cards;
    const opponentId = playerStat.opponentId;
    const subIn = playerStat.subIn;
    const subOut = playerStat.subOut;
    const points = playerStat.points;
//function addPlayerStats ({playerId, gameDay, seasonStart, goals, clubId, home, homeScore, awayScore, cards, subIn, subOut, points}) {
    if (playerId == null || typeof playerId !== "number") return Promise.reject(new Error('Parameter playerId is not specified or is not a number'));
    if (gameDay ==null || typeof gameDay !== "number") return Promise.reject(new Error('Parameter gameDay is not specified or is not a number'));
    if (seasonStart == null || typeof seasonStart !== "number") return Promise.reject(new Error('Parameter seasonStart is not specified or is not a number'));
    if (goals == null || typeof goals !== "number") return Promise.reject(new Error('Parameter goals is not specified or is not a number'));
    if (typeof(home) !== "boolean") return Promise.reject(new Error('Parameter home is not specified or is not a boolean'));
    if (cards && !(cards === "red" || cards === "yellow" || cards === "yellow-red")) return Promise.reject(new Error('Parameter cards must be either yellow, yellow-red or red'));
    if (!opponentId || typeof opponentId !== "number") return Promise.reject(new Error('Parameter opponentId is not specified or is not a number'));
    if (subIn != null && typeof subIn !== "number") return Promise.reject(new Error('Parameter subIn is not a number'));
    if (subOut != null && typeof subOut !== "number") return Promise.reject(new Error('Parameter subOut is not a number'));
    if (points != null && typeof points !== "number") return Promise.reject(new Error('Parameter points is not a number'));
    return getGames(seasonStart, gameDay, opponentId)
        .then(games => {
            if(games.length == 0) return Promise.reject(new Error('Could not find a game with seasonStart: ' + seasonStart + ", gameDay: " + gameDay + " and with oponnentId: " + opponentId));
            return models.PlayerStats.findOrCreate(
                { where: {
                    pid: playerId,
                    gamedayid: games[0].id,
                    goals: goals,
                    home: home,
                    cards: cards,
                    subin: subIn,
                    subout: subOut,
                    points: points
                } }
            );
        });
}

/**
 * @typedef PlayerStat
 * @type Object
 * @param {number} playerId - football player's id of the corresponding player statistics
 * @param {number} gameDay - stat's corresponding game day
 * @param {number} seasonStart - stat's corresponding season
 * @param {number} goals - football player's goals in that game
 * @param {number} clubId - football player's club given by its id
 * @param {boolean} home - true if it was a home game for the player and false if not
 * @param {number} homeScore - number of goals the home team scored
 * @param {number} awayScore - number of goals the away team scored
 * @param {String} cards - yellow, yellow-red or red
 * @param {number} opponentId - football player's opponent referenced by its id
 * @param {number} subIn - time when the player came in
 * @param {number} subOut - time when the player was substituted
 * @param {number} points - football player's comunio points for that game. Undefined when he played but did not get points
 */


/**
 *
 * @param {number} playerId - The player's id of the required player stat
 * @param {number} seasonStart - The start of the season of the required player stat
 * @param {number} gameDay - The game day of the required player stat
 * @returns {*|Promise.<PlayerStat>} - A promise of the player stats
 */
function getPlayerStats (playerId, seasonStart, gameDay) {
    if (!playerId || typeof playerId !== "number") return Promise.reject(new Error('Parameter playerId is not specified or is not a number'));
    const PlayerStats = models.PlayerStats;
    const GameSchedule = models.GameSchedule;
    if(!gameDay && typeof gameDay !== "number" && !seasonStart && typeof seasonStart !== "number")
        return PlayerStats.findAll({
            where : { pid: playerId},
            attributes: playerStatsAttributes,
            include: [ { model: GameSchedule, attributes: gameScheduleAttributesForPlayerStats }]
        })
            .then(stats => {
                return stats.map(stat => stat.toJSON());
            });
    else if(gameDay && seasonStart)
        if(typeof gameDay !== "number" || typeof seasonStart !== "number")
            return Promise.reject(new Error('One of the parameter gameDay or seasonStart is not a number'));
        else
            return PlayerStats.findAll({
                where : { pid: playerId },
                attributes: playerStatsAttributes,
                include: [{
                    model: GameSchedule,
                    attributes: gameScheduleAttributesForPlayerStats,
                    where: {
                        gameday: gameDay,
                        seasonStart: seasonStart
                    }
                }]
            })
                .then(stats => stats.map(stat => stat.toJSON()));
    else if(seasonStart)
        if(typeof seasonStart !== "number")
            return Promise.reject(new Error('seasonStart is not a number'));
        else
            return PlayerStats.findAll({
                where : { pid: playerId },
                attributes: playerStatsAttributes,
                include: [{
                    model: GameSchedule,
                    attributes: gameScheduleAttributesForPlayerStats,
                    where: {
                        seasonstart: seasonStart
                    }
                }]
            })
                .then(stats => stats.map(stat => stat.toJSON()));
    else
        return Promise.reject(new Error('The parameter gameDay can only be given together with the parameter seasonStart'));
}

/**
 * @typedef Game
 * @ptype Object
 * @param {number} gameDay - game's game day
 * @param {number} homeClubId - home club's id
 * @param {number} guestClubId - guest club's id
 * @param {number} [homeScore] - home club's score
 * @param {number} [guestScore] - guest club's score
 */

/**
 *
 * @param {Game} game - Game which should be added
 * @returns {Promise.<Instance, created>} promise which references the database transaction
 */
function addGame(game) {
    const gameDay = game.gameDay;
    const seasonStart = game.seasonStart;
    const homeScore = game.homeScore;
    const guestScore = game.guestScore;
    const homeClubId = game.homeClubId;
    const guestClubId = game.guestClubId;

    if(checkIfNumber(gameDay)) return noExistenceOrNoNumberRejection("gameDay");
    if(checkIfNumber(seasonStart)) return noExistenceOrNoNumberRejection("seasonStart");
    if(checkIfNumber(homeClubId)) return noExistenceOrNoNumberRejection("homeClubId");
    if(checkIfNumber(guestClubId)) return noExistenceOrNoNumberRejection("guestClubId");
    if(homeScore && checkIfNumber(homeScore)) return noNumberRejection("homeScore");
    if(guestScore && checkIfNumber(guestScore)) return noNumberRejection("guestScore");

    return models.GameSchedule.findOrCreate(
        { where: {
            gameday: gameDay,
            seasonstart: seasonStart,
            homescore: homeScore,
            guestscore: guestScore,
            homeclubid: homeClubId,
            guestclubid: guestClubId
        } }
    );
}

/**
 *
 * @param {number} seasonStart - starting year of the season of which the games will be returned
 * @param {number} [gameDay] - games' game day
 * @param {number} [guestClubId] - games' game day
 * @returns {*|Promise.<Game[]>} promise of the games
 */
function getGames(seasonStart, gameDay, guestClubId) {
    if(checkIfNumber(seasonStart)) return noExistenceOrNoNumberRejection("seasonStart");
    if(gameDay) {
        if(checkIfNumber(gameDay)) return noExistenceOrNoNumberRejection("gameDay");
        else if(guestClubId) {
            if(checkIfNumber(guestClubId)) return noExistenceOrNoNumberRejection("guestClubId");
            else return models.GameSchedule.findAll({ where : { gameday: gameDay, seasonstart: seasonStart, guestclubid: guestClubId}, attributes: gameScheduleAttributes})
                .then(games => games.map(game => game.toJSON()));
        } else
            return models.GameSchedule.findAll({ where : { gameday: gameDay, seasonstart: seasonStart }, attributes: gameScheduleAttributes})
                .then(games => games.map(game => game.toJSON()));
    } else {
        return models.GameSchedule.findAll({ where : { seasonstart: seasonStart }, attributes: gameScheduleAttributes})
            .then(games => games.map(game => game.toJSON()));
    }
}

function checkIfNumber(number) {
    return number == null || typeof number !== "number"
}

function noExistenceOrNoNumberRejection(parameter) {
    return Promise.reject(new Error('Parameter ' + parameter + ' is not specified or is not a number'));
}

function noNumberRejection(parameter) {
    return Promise.reject(new Error('Parameter ' + parameter +  ' is not a number'));
}

/**
 *
 * @param {number} playerId - football player's id of which the stats are asked
 * @param {number} [seasonStart] - season of the game
 * @param {number} [gameDay] - stat's game
 * @returns {*|Promise.<PlayerStat>} A promise of all game stats of the given football player
 */

module.exports = {
    addNews,
    getNews,
    getPlayers,
    getClubs,
    getPlayerValues,
    getAllPlayerValues,
    addPlayerValues,
    lookUpPlayerId,
    addPlayerStats,
    getPlayerStats,
    addGame,
    getGames
}