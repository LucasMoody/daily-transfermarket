'use strict';

var Q = require('q');
var comunio = require('comunio');
var moment = require('moment');
var seneca = require('seneca')();
var dbApi = seneca.client(10102);

function getPlayerValues (numOfDays) {
	numOfDays = numOfDays === undefined ? 90 : numOfDays;
	dbApi.act('role:database,players:get', function(err, result) {
		result.reduce(function(previous, next) {
			return previous.then(function() {
					return comunio.getMarketValueForPlayer(next.complayerid, numOfDays)
						.then(res => {
							dbApi.act({role: 'database', playerValues: 'add', data: { playerId: next.id, values : res } });
						});
				})
				.catch(function(err) {
					console.error(err);
				});
		},Q());
	});
}

function getPlayerValuesForToday () {
	dbApi.act('role:database,clubs:get', (res, err) => {
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
								date: new Date()
							}
						}
					}, (res, error) => err ? console.error(error) : console.log(res))
				);
			});
	});
}

function saveMissingPlayerValues () {
	dbApi.act('role:database,playerValues:getAll', (res, err) => {
		// output: [ { id: Integer, pid: Integer, complayerid: Integer, name: String, position: String, clubid: Integer, value: Integer, valdate: Date }, ... ]
		const dates = {}, playerValueDates = {};
		const sortedDates = res
			.filter( player => player.valdate )
			.sort((a, b) => moment(a) < moment(b) ? -1 : moment(a) == moment(b) ? 0 : 1);
		const firstDate = sortedDates.length > 0 ? sortedDates[0] : new Date();
		let curDate = moment(firstDate);
		const today = moment();
		while (firstDate <= today) {
			dates[curDate.format("YYYY-MM-DD")] = true;
			curDate = curDate.add(1, "days");
		}
		res
			.filter(player => !dates.hasOwnProperty(player.valdate))
			.forEach(player => {
					comunio.getMarketValueForPlayerAtDate(String(player.complayerid), player.valdate)
						.then(oMarketValue => {
							dbApi.act({
								role: database,
								playerValues: add,
								data: {
									playerId: player.pid,
									values: [{
										quote: oMarketValue.quote,
										date: moment(oMarketValue.valdate).format("YYYY-MM-DD"),
									}]
								}
							});
						})
			})
			//getMarketValueForPlayerAtDate
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
		!isNaN(arg) ? fun(process.argv[i++]) : fun();
	} else {
		fun();
	}
}