'use strict';

var Q = require('q');
var comunio = require('comunio');
var moment = require('moment');
var seneca = require('seneca')();
var dbApi = seneca.client(10102);

function getPlayerValues (numOfDays) {
	numOfDays = numOfDays === undefined || isNaN(numOfDays)? 90 : numOfDays;
	dbApi.act('role:database,players:get', function(err, result) {
		result.reduce(function(previous, next) {
			return previous.then(function() {
					return comunio.getMarketValueForPlayer(next.complayerid, numOfDays)
						.then(res => {
							dbApi.act({role: 'database', playerValues: 'add', data: {
								playerId: next.id, values : res.map(val => ({ quote: val.quote, valdate: val.date } ))
							} });
						});
				})
				.catch(function(err) {
					console.error(err);
				});
		},Q());
	});
}

function getPlayerValuesForToday () {
	dbApi.act('role:database,clubs:get', (err, res) => {
		if(err)
			return console.error(err);

		Q.all(
			res.filter(item => item.comclubid)
				.map(clubId => comunio.getPlayersByClubId(clubId))
			)
			.then(clubsWithPlayers => clubsWithPlayers.reduce((previous, next) => previous.concat(next)))
			.then(players => {
				players.forEach(player =>
					dbApi.act({
						role: 'database',
						playerValues: 'add',
						data: {
							playerId: player.id,
							values: {
								quote: player.quote,
								date: moment().format('YYYY-MM-DD')
							}
						}
					}, (res, error) => err ? console.error(error) : console.log(res))
				);
			});
	});
}

function saveMissingPlayerValues () {
	dbApi.act('role:database,playerValues:getAll', (err, res) => {
		if(err)
			return console.error(err);
		dbApi.act('role:database,players:get', (err, players) => {
			if(err)
				return console.error(err);

			//get map for player id and player comunio id
			const playerMap = players.reduce((previous, next) => {
				previous[String(next.id)] = next.complayerid;
				return previous;
			}, {});


			const dates = [], playerValueDates = {};
			//calculate first found market value date
			const sortedDates = res
				.map( player => player.valdate )
				.sort((a, b) => (a > b) - (a < b));
			const firstDate = sortedDates.length > 0 ? sortedDates[0] : new Date();

			//create
			let curDate = moment(firstDate);
			const today = moment();
			while (curDate <= today) {
				dates.push(curDate.format("YYYY-MM-DD"));
				curDate = curDate.add(1, "days");
			}
			//determine all market value dates for each player
			const playerDatesMap = res.reduce((previous, next) => {
				//date is not contained in date map of current player
				if(previous[String(next.pid)] != undefined) {
					previous[String(next.pid)][moment(next.valdate).format('YYYY-MM-DD')] = true;
				} else {
					previous[String(next.pid)] = {};
					previous[String(next.pid)][moment(next.valdate).format('YYYY-MM-DD')] = true;
				}
				return previous;
			}, {});

			//determine the missing market value dates
			const playerIdsWithDates = Object.keys(playerDatesMap)
				.reduce((previous, next) => {
					previous[next] = dates.filter(val => playerDatesMap[next][val] == undefined);
					return previous
				}, {});
			//flatten that map to an array
			const missingMarketValues = Object.keys(playerDatesMap)
				.reduce((previous, next) => {
					return previous.concat(playerIdsWithDates[next].map(date => ({pid: next, complayerid: playerMap[next], date: date})));
				}, []);
			missingMarketValues.reduce((previous, player) => {
					return previous.then(() => {
						return comunio.getMarketValueForPlayerAtDate(String(player.complayerid), player.date)
							.then(oMarketValue => {
								dbApi.act({
									role: 'database',
									playerValues: 'add',
									data: {
										playerId: player.pid,
										values: [{
											quote: oMarketValue.quote,
											valdate: moment(oMarketValue.date).format("YYYY-MM-DD")
										}]
									}
								});
							})
							.catch(err => console.error(err));
					});
				}, Q());
			//getMarketValueForPlayerAtDate
		});
	});
}

module.exports = {
	getPlayerValues,
	getPlayerValuesForToday,
	saveMissingPlayerValues
}

for (let i = 2; i<process.argv.length; i++) {
	const fun = module.exports[process.argv[i]];
	if (fun === getPlayerValues && i + 1 < process.argv.length) {
		const arg = process.argv[i+1];
		!isNaN(arg) ? fun(Number(process.argv[++i])) : fun();
	} else {
		fun();
	}
}