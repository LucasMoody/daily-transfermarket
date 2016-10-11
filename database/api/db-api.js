"use strict";

const dbConnection = require('../lib/db-connection.js');

module.exports = function database(options) {
	// input: [{ title: title, description: description, link: link, categories: categories, pubDate: pubDate, date: date }, ...]
	// output: { successfull: true/false}
	this.add('role:database,news:add', addNews);
	// input: { playerId: playerId }
	// output: { id: id, link: link, headline: headline, newstext: newstext, newsdate: newsdate, pid: pid }
	this.add('role:database,news:get', getNews);
	this.add('role:database,players:get', getPlayers);
	// input: nothing
	// output: [ {  } ]
	this.add('role:database,clubs:get', getClubs);
	this.add('role:database,playerValues:get', getPlayerValues);
	this.add('role:database,playerValues:add', addPlayerValues)
	this.add('role:database,player:lookUpPlayerId', lookUpPlayerId);
	// input: nothing
	// output: [ { id, pid, complayerid, name, position, clubid, value, valedate }, ... ]
	this.add('role:database,playerValues:getAll', getAllPlayerValues);
	this.add('role:database,playerStats:get', getPlayerStats);
	this.add('role:database,playerStats:add', addPlayerStats);
	this.add('role:database,playerStats:addAll', addAllPlayerStats);
	this.add('role:database,game:add', addGame);
	this.add('role:database,games:get', getGames);
}

function addNews (msg, respond) {
	//validation
	if (!msg.data) {
		return respond(new Error('data property is not defined as a parameter'));
	}
	const news = msg.data;
	if (Object.prototype.toString.call(news) !== '[object Array]') {
		return respond(new Error('data parameter should be an array of news'));
	}
	dbConnection.addNews(news)
		.then(status => respond(null, status))
		.catch(err => respond(err));
}

function getNews(msg, respond) {
	//validation
	if (!msg.data) {
		return respond(new Error('data property is not defined as a parameter'));
	}
	const playerId = msg.data;
	if (!playerId)
		return respond(new Error('Please specify the playerId property in the data property of the message'));

	// defer to dbConnection
	dbConnection.getNews(playerId)
		.then(news => respond(null, news))
		.catch(err => respond(err));
}

function getPlayers (msg, respond) {
	dbConnection.getPlayers()
		.then(players => respond(null, players))
		.catch(err => respond(err));
}

function getClubs (msg, respond) {
	dbConnection.getClubs()
		.then(clubs => respond(null, clubs))
		.catch(err => respond(err));
}

function getPlayerValues (msg, respond) {
	if(!msg.data)
		return respond(new Error('data property must be defined and it should contain the playerId'));
	var playerId = msg.data.playerId;
	if (!playerId)
		return respond(new Error('Please specify the playerId property in the data property of the message'));
	var noOfDays = msg.data.noOfDays;
	if (!noOfDays)
		return respond(new Error('Please specify the noOfDays property in the data property of the message'));
	dbConnection.getPlayerValues(playerId, noOfDays)
		.then(playerValues => respond(null, playerValues))
		.catch(err => respond(err));
}

function getAllPlayerValues (msg, respond) {
	dbConnection.getAllPlayerValues()
		.then(playerValues => respond(null, playerValues))
		.catch(err => respond(err));
}

/**
 * Api function to add player values
 * @param {Object} msg.data
 * @param {number} msg.data.playerId
 * @param {Array.<Object>} msg.data.values
 * @param respond
 * @returns {*}
 */
function addPlayerValues (msg, respond) {
	const dbPromises = [];
	if(!msg.data)
		return respond(new Error('data property must be defined and it should contain the playerId and a values array containing {date: date, value: value} objects'));
	const playerId = msg.data.playerId;
	if (!playerId)
		return respond(new Error('Please specify the playerId property in the data property of the message'));
	const values = msg.data.values;
	if (!values) {
		return respond(new Error('The value property of data should be an array containing {quote: Integer, valdate: Date} objects'));
	}
	try {
		const keysCorrect = values.reduce((previous, next) => {
			return previous && next.quote != undefined && next.valdate != undefined;
		}, true);
		if(!keysCorrect) {
			return respond(new Error('The value property of data should be an array containing {quote: Integer, valdate: Date} objects'));
		}
	} catch(err) {
		return respond(new Error('The value property of data should be an array containing {quote: Integer, valdate: Date} objects'));
	}

	dbConnection.addPlayerValues(playerId, values)
		.then(status => respond(null, status))
		.catch(err =>
			respond(err));
}

function lookUpPlayerId (msg, respond) {
	if(!msg.data)
		return respond(new Error('data property must be defined and it should contain the comPlayerId'));
	const comPlayerId = msg.data.comPlayerId;
	if (!comPlayerId)
		return respond(new Error('Please specify the comPlayerId property in the data property of the message'));
	dbConnection.lookUpPlayerId(comPlayerId)
		.then(playerId => respond(null, playerId))
		.catch(err => respond(err));
}

function getPlayerStats (msg, respond) {
	if(!msg.data) return respond(new Error('data property must be defined and it should contain the comPlayerId'));
	const playerId = msg.data.playerId;
	const gameDay = msg.data.gameDay;
	const seasonStart = msg.data.seasonStart;
	if (!playerId || typeof playerId !== "number") return respond(new Error('Parameter playerId is not specified or is not a number'));
	dbConnection.getPlayerStats(playerId, seasonStart, gameDay)
		.then(stats => respond(null, stats))
		.catch(err => respond(err));
}

function addPlayerStats (msg, respond) {
	if(!msg.data) return respond(new Error('data property must be defined and it should contain the comPlayerId'));
	const playerId = msg.data.playerId;
	const gameDay = msg.data.gameDay;
	const seasonStart = msg.data.seasonStart;
	const goals = msg.data.goals;
	const opponentId = msg.data.opponentId;
	const home = msg.data.home;
	const cards = msg.data.cards;
	const subIn = msg.data.subIn;
	const subOut = msg.data.subOut;
	const points = msg.data.points;

	if (playerId == null || typeof playerId !== "number") return respond(new Error('Parameter playerId is not specified or is not a number'));
	if (gameDay ==null || typeof gameDay !== "number") return respond(new Error('Parameter gameDay is not specified or is not a number'));
	if (seasonStart == null || typeof seasonStart !== "number") return respond(new Error('Parameter seasonStart is not specified or is not a number'));
	if (goals == null || typeof goals !== "number") return respond(new Error('Parameter goals is not specified or is not a number'));
	if (!opponentId || typeof opponentId !== "number") return respond(new Error('Parameter opponentId is not specified or is not a number'));
	if (typeof(home) !== "boolean") return respond(new Error('Parameter home is not specified or is not a boolean'));
	if (cards && !(cards === "red" || cards === "yellow" || cards === "yellow-red")) return respond(new Error('Parameter cards must be either yellow, yellow-red or red but is ' + cards));
	if (subIn != null && typeof subIn !== "number") return respond(new Error('Parameter subIn is not a number'));
	if (subOut != null && typeof subOut !== "number") return respond(new Error('Parameter subOut is not a number'));
	if (points != null && typeof points !== "number") return respond(new Error('Parameter points is not a number'));

	dbConnection.addPlayerStats({
		playerId,
		gameDay,
		seasonStart,
		goals,
		opponentId,
		home,
		cards,
		subIn,
		subOut,
		points
	})
		.then(status => respond(undefined, status))
		.catch(err => respond(err));
}

function addAllPlayerStats (msg, respond) {
	if(!msg.data) return respond(new Error('data property must be defined and it should contain the comPlayerId'));
	Promise.all(msg.data.map(playerStat => dbConnection.addPlayerStats(playerStat)))
		.then(status => respond(undefined, status))
		.catch(err => respond(err));
}

function addGame(msg, respond) {
	if(!msg.data) return respond(new Error('data property must be defined and it should contain the comPlayerId'));
	const gameDay = msg.data.gameDay;
	const seasonStart = msg.data.seasonStart;
	const homeScore = msg.data.homeScore;
	const guestScore = msg.data.guestScore;
	const homeClubId = msg.data.homeClubId;
	const guestClubId = msg.data.guestClubId;

	if(checkIfNumber(gameDay)) return respond(noExistenceOrNoNumberRejection("gameDay"));
	if(checkIfNumber(seasonStart)) return respond(noExistenceOrNoNumberRejection("seasonStart"));
	if(checkIfNumber(homeClubId)) return respond(noExistenceOrNoNumberRejection("homeClubId"));
	if(checkIfNumber(guestClubId)) return respond(noExistenceOrNoNumberRejection("guestClubId"));
	if(homeScore && checkIfNumber(homeScore)) return respond(noNumberRejection("homeScore"));
	if(guestScore && checkIfNumber(guestScore)) return respond(noNumberRejection("guestScore"));

	dbConnection.addGame({
		gameDay,
		seasonStart,
		homeScore,
		guestScore,
		homeClubId,
		guestClubId
	})
		.then(status => respond(null, status))
		.catch(err => respond(err));
}

function getGames(msg, respond) {
	if(!msg.data) return respond(new Error('data property must be defined and it should contain the comPlayerId'));
	const seasonStart = msg.data.seasonStart;
	const gameDay = msg.data.gameDay;

	dbConnection.getGames(seasonStart, gameDay)
		.then(games => respond(null, games))
		.catch(err => respond(err));
}

function checkIfNumber(number) {
	return number == null || typeof number !== "number"
}

function noExistenceOrNoNumberRejection(parameter) {
	return new Error('Parameter ' + parameter + ' is not specified or is not a number');
}

function noNumberRejection(parameter) {
	return new Error('Parameter ' + parameter +  ' is not a number');
}