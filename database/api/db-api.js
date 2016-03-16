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
		.catch(err => respond(err));
}

function lookUpPlayerId (msg, respond) {
	if(!msg.data)
		return respond(new Error('data property must be defined and it should contain the comPlayerId'));
	const comPlayerId = msg.comPlayerId;
	if (!comPlayerId)
		return respond(new Error('Please specify the comPlayerId property in the data property of the message'));
	dbConnection.lookUpPlayerId(comPlayerId)
		.then(playerId => respond(null, playerId))
		.catch(err => respond(err));
}
