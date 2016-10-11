const dbInit = require("./init-db.js");
const dbConnection = require("../lib/db-connection.js");
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiThings = require('chai-things');
chai.use(chaiThings);
chai.use(chaiAsPromised);
const should = chai.should();
const moment = require('moment');
const seneca = require('seneca')();
seneca.use(require('../api/db-api.js'));

beforeEach(function(done) {
	this.timeout(10000);
	return dbInit.initModels()
		.then(() => done())
		.catch(err => {
			console.error(err);
			done();
		});
});

afterEach(function(done) {
	this.timeout(10000);
	return dbInit.clearDatabase()
		.then(() => done())
		.catch(err => {
			console.error(err);
			done();
		});
});

describe('getPlayers', () => {
	describe('library', () => {
		it('should return an array of players which has the size 524.', () => {
			return dbConnection.getPlayers().should.eventually.have.length(524);
		});

		it('should return an array of players where every player has the attributes id, complayerid, name, position, clubid', function() {
			return dbConnection.getPlayers().should.eventually.all.contain.keys('id', 'complayerid', 'name', 'position', 'clubid');
		});
	});



	describe('api', () => {
		it('should return an array of players which has the size 524.', done => {
			seneca.act('role:database,players:get', (err, res) => {
				res.should.have.length(524);
				done();
			});
		});

		it('should return an array of players where every player has the attributes id, complayerid, name, position, clubid', done => {
			seneca.act('role:database,players:get', (err, res) => {
				res.should.all.contain.keys('id', 'complayerid', 'name', 'position', 'clubid');
				done();
			});
		});

	});
});

describe('getClubs', function() {
	describe('library', () => {
		it('should return an array of clubs which has the size 18.', () => {
			return dbConnection.getClubs().should.eventually.have.length(18);
		});

		it('should return an array of clubs where every club has the attributes id, clubname, comclubid', () => {
			return dbConnection.getClubs().should.eventually.all.contain.keys('id', 'clubname', 'comclubid');
		});
	});

	describe('api', () => {
		it('should return an array of clubs which has the size 18.', done => {
			seneca.act('role:database,clubs:get', (err, res) => {
				res.should.have.length(18);
				done();
			});
		});

		it('should return an array of clubs where every club has the attributes id, clubname, comclubid', done => {
			seneca.act('role:database,clubs:get', (err, res) => {
				res.should.all.contain.keys('id', 'clubname', 'comclubid');
				done();
			});
		});
	});
});

describe('addPlayerValues', function() {
	describe('library', () => {
		it('should add for football player with id 1 the market values 1.000.000 at the 21.01.2016 and 1.200.000 at the 23.01.2016', () => {
			return dbConnection.addPlayerValues(1,[{quote: 1000000, valdate: '2016-01-21'}, {quote: 1200000, valdate: '2016-01-23'}])
				.then(() => {
					return dbConnection.getPlayerValues(1,2);
				}).should.eventually.eql([{value: 1000000, valdate: moment('2016-01-21', 'YYYY-MM-DD').toDate(), pid: 1},{value: 1200000, valdate: moment('2016-01-23', 'YYYY-MM-DD').toDate(), pid: 1}]);
		});

		it('should throw an error for market value with the date 2016-32-01 which does not exist', function() {
			return dbConnection.addPlayerValues(1,[{quote: 1000000, valdate: '2016-32-01'}])
				.should.eventually.be.rejectedWith(Error);
		});

		it('should throw an error when quote is a string', function() {
			return dbConnection.addPlayerValues(1,[{quote: "quote", valdate: '2016-01-01'}])
				.should.eventually.be.rejectedWith(Error);
		});

		it('should throw an error when quote is undefined', function() {
			return dbConnection.addPlayerValues(1,[{quote: undefined, valdate: '2016-01-01'}])
				.should.eventually.be.rejectedWith(Error);
		});

		it('should throw an error when id is undefined', function() {
			return dbConnection.addPlayerValues(undefined,[{quote: 1000000, valdate: '2016-01-01'}])
				.should.eventually.be.rejectedWith(Error);
		});

		it('should throw an error when id is not a number', function() {
			return dbConnection.addPlayerValues("hello",[{quote: 1000000, valdate: '2016-01-01'}])
				.should.eventually.be.rejectedWith(Error);
		});
	});



	describe('api', () => {
		it('should add for football player with id 1 the market values 1.000.000 at the 21.01.2016 and 1.200.000 at the 23.01.2016', function(done) {
			seneca.error(done);
			seneca.act({
				role: "database",
				playerValues: "add",
				data: {
					playerId: 1,
					values: [{quote: 1000000, valdate: '2016-01-21'}, {quote: 1200000, valdate: '2016-01-23'}]
				}
			}, (err, res) => {
				if(err)
					done(err);
				seneca.act({
					role: "database",
					playerValues: "get",
					data: {
						playerId: 1,
						noOfDays: 2
					}
				}, (err, res) => {
					if(err)
						done(err);
					res.should.eql([{value: 1000000, valdate: moment('2016-01-21', 'YYYY-MM-DD').toDate(), pid: 1},{value: 1200000, valdate: moment('2016-01-23', 'YYYY-MM-DD').toDate(), pid: 1}]);
					done();
				});
			});
		});

		it('should throw an error for market value with the date 2016-32-01 which does not exist', function(done) {
			//seneca.error(done);
			seneca.act({
				role: "database",
				playerValues: "add",
				data: {
					playerId: 1,
					values: [{quote: 1000000, valdate: '2016-32-01'}]
				}
			}, (err, res) => {
				seneca.error(done);
				err.should.be.an.instanceOf(Error);
				done();
			});
		});

		it('should throw an error when quote is a string', function(done) {
			seneca.act({
				role: "database",
				playerValues: "add",
				data: {
					playerId: 1,
					values: [{quote: "quote", valdate: '2016-01-01'}]
				}
			}, (err, res) => {
				seneca.error(done);
				err.should.be.an.instanceOf(Error);
				done();
			});
		});

		it('should throw an error when quote is undefined', function(done) {
			seneca.act({
				role: "database",
				playerValues: "add",
				data: {
					playerId: 1,
					values: [{quote: undefined, valdate: '2016-01-01'}]
				}
			}, (err, res) => {
				seneca.error(done);
				err.should.be.an.instanceOf(Error);
				done();
			});
		});

		it('should throw an error when id is undefined', function(done) {
			seneca.act({
				role: "database",
				playerValues: "add",
				data: {
					playerId: undefined,
					values: [{quote: 1000000, valdate: '2016-01-01'}]
				}
			}, (err, res) => {
				seneca.error(done);
				err.should.be.an.instanceOf(Error);
				done();
			});
		});

		it('should throw an error when id is not a number', function(done) {
			seneca.act({
				role: "database",
				playerValues: "add",
				data: {
					playerId: 'hello',
					values: [{quote: 1000000, valdate: '2016-01-01'}]
				}
			}, (err, res) => {
				seneca.error(done);
				err.should.be.an.instanceOf(Error);
				done();
			});
		});
	});
});

describe('getPlayerValues', function() {
	describe('library', () => {
		it('should return 10 market values of player with id 10', () => {
			return dbConnection.addPlayerValues(1,[
					{quote: 1000000, valdate: '2016-01-01'},
					{quote: 1000000, valdate: '2016-01-02'},
					{quote: 1000000, valdate: '2016-01-03'},
					{quote: 1000000, valdate: '2016-01-04'},
					{quote: 1000000, valdate: '2016-01-05'},
					{quote: 1000000, valdate: '2016-01-06'},
					{quote: 1000000, valdate: '2016-01-07'},
					{quote: 1000000, valdate: '2016-01-08'},
					{quote: 1000000, valdate: '2016-01-09'},
					{quote: 1000000, valdate: '2016-01-10'},
					{quote: 1000000, valdate: '2016-01-11'},
					{quote: 1000000, valdate: '2016-01-12'},
					{quote: 1000000, valdate: '2016-01-13'},
					{quote: 1000000, valdate: '2016-01-14'},
					{quote: 1000000, valdate: '2016-01-15'},
					{quote: 1000000, valdate: '2016-01-16'}
				])
				.then(() => {
					return dbConnection.getPlayerValues(1, 10);
				}).should.eventually.have.length(10);
		});

		it('should return 10 market values of player with id 1', () => {
			return dbConnection.addPlayerValues(1,[
					{quote: 1000000, valdate: '2016-01-01'},
					{quote: 1100000, valdate: '2016-01-02'},
					{quote: 1200000, valdate: '2016-01-03'},
					{quote: 1300000, valdate: '2016-01-04'},
					{quote: 1400000, valdate: '2016-01-05'},
					{quote: 1500000, valdate: '2016-01-06'},
					{quote: 1600000, valdate: '2016-01-07'},
					{quote: 1700000, valdate: '2016-01-08'},
					{quote: 1800000, valdate: '2016-01-09'},
					{quote: 1900000, valdate: '2016-01-10'},
					{quote: 2000000, valdate: '2016-01-11'},
					{quote: 2100000, valdate: '2016-01-12'},
					{quote: 2200000, valdate: '2016-01-13'},
					{quote: 2300000, valdate: '2016-01-14'},
					{quote: 2400000, valdate: '2016-01-15'},
					{quote: 2500000, valdate: '2016-01-16'}
				])
				.then(() => {
					return dbConnection.getPlayerValues(1, 10);
				}).should.eventually.be.eql([
					{pid: 1, value: 1600000, valdate: moment('2016-01-07', "YYYY-MM-DD").toDate()},
					{pid: 1, value: 1700000, valdate: moment('2016-01-08', "YYYY-MM-DD").toDate()},
					{pid: 1, value: 1800000, valdate: moment('2016-01-09', "YYYY-MM-DD").toDate()},
					{pid: 1, value: 1900000, valdate: moment('2016-01-10', "YYYY-MM-DD").toDate()},
					{pid: 1, value: 2000000, valdate: moment('2016-01-11', "YYYY-MM-DD").toDate()},
					{pid: 1, value: 2100000, valdate: moment('2016-01-12', "YYYY-MM-DD").toDate()},
					{pid: 1, value: 2200000, valdate: moment('2016-01-13', "YYYY-MM-DD").toDate()},
					{pid: 1, value: 2300000, valdate: moment('2016-01-14', "YYYY-MM-DD").toDate()},
					{pid: 1, value: 2400000, valdate: moment('2016-01-15', "YYYY-MM-DD").toDate()},
					{pid: 1, value: 2500000, valdate: moment('2016-01-16', "YYYY-MM-DD").toDate()}
				]);
		});

		it('should return 0 market values of player with id 1 because player with id 1 has no market values in the db ', () => {
			return dbConnection.getPlayerValues(1, 10).should.eventually.have.length(0);
		});
	});

	describe('api', () => {
		it('should return 10 market values of player with id 10', done => {
			seneca.act({
				role: 'database',
				playerValues: 'add',
				data: {
					playerId: 1,
					values: [
						{quote: 1000000, valdate: '2016-01-01'},
						{quote: 1000000, valdate: '2016-01-02'},
						{quote: 1000000, valdate: '2016-01-03'},
						{quote: 1000000, valdate: '2016-01-04'},
						{quote: 1000000, valdate: '2016-01-05'},
						{quote: 1000000, valdate: '2016-01-06'},
						{quote: 1000000, valdate: '2016-01-07'},
						{quote: 1000000, valdate: '2016-01-08'},
						{quote: 1000000, valdate: '2016-01-09'},
						{quote: 1000000, valdate: '2016-01-10'},
						{quote: 1000000, valdate: '2016-01-11'},
						{quote: 1000000, valdate: '2016-01-12'},
						{quote: 1000000, valdate: '2016-01-13'},
						{quote: 1000000, valdate: '2016-01-14'},
						{quote: 1000000, valdate: '2016-01-15'},
						{quote: 1000000, valdate: '2016-01-16'}
					]
				}
			}, (err, res) => {
				if(err)
					done(err);
				seneca.act({
					role: 'database',
					playerValues: 'get',
					data: {
						playerId: 1,
						noOfDays: 10
					}
				}, (err, res) => {
					if(err)
						done(err);
					res.should.have.length(10);
					done();
				});
			});
		});

		it('should return 10 market values of player with id 1', function(done) {
			this.timeout(10000);
			seneca.act({
				role: 'database',
				playerValues: 'add',
				data: {
					playerId: 1,
					values: [
						{quote: 1000000, valdate: '2016-01-01'},
						{quote: 1100000, valdate: '2016-01-02'},
						{quote: 1200000, valdate: '2016-01-03'},
						{quote: 1300000, valdate: '2016-01-04'},
						{quote: 1400000, valdate: '2016-01-05'},
						{quote: 1500000, valdate: '2016-01-06'},
						{quote: 1600000, valdate: '2016-01-07'},
						{quote: 1700000, valdate: '2016-01-08'},
						{quote: 1800000, valdate: '2016-01-09'},
						{quote: 1900000, valdate: '2016-01-10'},
						{quote: 2000000, valdate: '2016-01-11'},
						{quote: 2100000, valdate: '2016-01-12'},
						{quote: 2200000, valdate: '2016-01-13'},
						{quote: 2300000, valdate: '2016-01-14'},
						{quote: 2400000, valdate: '2016-01-15'},
						{quote: 2500000, valdate: '2016-01-16'}
					]
				}
			}, (err, res) => {
				if(err)
					done(err);
				seneca.act({
					role: 'database',
					playerValues: 'get',
					data: {
						playerId: 1,
						noOfDays: 10
					}
				}, (err, res) => {
					if(err)
						done(err);
					res.should.be.eql([
						{pid: 1, value: 1600000, valdate: moment('2016-01-07', "YYYY-MM-DD").toDate()},
						{pid: 1, value: 1700000, valdate: moment('2016-01-08', "YYYY-MM-DD").toDate()},
						{pid: 1, value: 1800000, valdate: moment('2016-01-09', "YYYY-MM-DD").toDate()},
						{pid: 1, value: 1900000, valdate: moment('2016-01-10', "YYYY-MM-DD").toDate()},
						{pid: 1, value: 2000000, valdate: moment('2016-01-11', "YYYY-MM-DD").toDate()},
						{pid: 1, value: 2100000, valdate: moment('2016-01-12', "YYYY-MM-DD").toDate()},
						{pid: 1, value: 2200000, valdate: moment('2016-01-13', "YYYY-MM-DD").toDate()},
						{pid: 1, value: 2300000, valdate: moment('2016-01-14', "YYYY-MM-DD").toDate()},
						{pid: 1, value: 2400000, valdate: moment('2016-01-15', "YYYY-MM-DD").toDate()},
						{pid: 1, value: 2500000, valdate: moment('2016-01-16', "YYYY-MM-DD").toDate()}
					]);
					done();
				});
			});
		});

		it('should return 0 market values of player with id 1 because player with id 1 has no market values in the db ', done => {
			seneca.act({
				role: 'database',
				playerValues: 'get',
				data: {
					playerId: 1,
					noOfDays: 10
				}
			}, (err, res) => {
				if(err)
					done(err);
				res.should.have.length(0);
				done();
			});
		});
	})
});

describe('getAllPlayerValues', () => {
	describe('library', () => {
		it('should return 5 market values for player with id 1 and 4 market values for player with id 2 and 2 market values for player with id 10', () => {
			return dbConnection.addPlayerValues(1, [
					{quote: 1600000, valdate: '2016-01-07'},
					{quote: 1700000, valdate: '2016-01-08'},
					{quote: 1800000, valdate: '2016-01-09'},
					{quote: 1900000, valdate: '2016-01-10'},
					{quote: 2000000, valdate: '2016-01-11'}
			])
			.then(() => {
				return dbConnection.addPlayerValues(2, [
					{quote: 2600000, valdate: '2015-11-07'},
					{quote: 2700000, valdate: '2015-11-08'},
					{quote: 2800000, valdate: '2015-11-09'},
					{quote: 2900000, valdate: '2015-11-10'}
				]);
			})
			.then(() => {
				return dbConnection.addPlayerValues(10, [
					{quote: 4600000, valdate: '2016-02-07'},
					{quote: 4700000, valdate: '2016-02-08'	}
				]);
			})
			.then(() => dbConnection.getAllPlayerValues())
			.should.eventually.deep.eq([
				{pid: 1, value: 1600000, valdate: moment('2016-01-07', "YYYY-MM-DD").toDate()},
				{pid: 1, value: 1700000, valdate: moment('2016-01-08', "YYYY-MM-DD").toDate()},
				{pid: 1, value: 1800000, valdate: moment('2016-01-09', "YYYY-MM-DD").toDate()},
				{pid: 1, value: 1900000, valdate: moment('2016-01-10', "YYYY-MM-DD").toDate()},
				{pid: 1, value: 2000000, valdate: moment('2016-01-11', "YYYY-MM-DD").toDate()},
				{pid: 2, value: 2600000, valdate: moment('2015-11-07', "YYYY-MM-DD").toDate()},
				{pid: 2, value: 2700000, valdate: moment('2015-11-08', "YYYY-MM-DD").toDate()},
				{pid: 2, value: 2800000, valdate: moment('2015-11-09', "YYYY-MM-DD").toDate()},
				{pid: 2, value: 2900000, valdate: moment('2015-11-10', "YYYY-MM-DD").toDate()},
				{pid: 10, value: 4600000, valdate: moment('2016-02-07', "YYYY-MM-DD").toDate()},
				{pid: 10, value: 4700000, valdate: moment('2016-02-08', "YYYY-MM-DD").toDate()}
			]);
		});

		it('should return an array of market values with length 8', () => {
			return dbConnection.addPlayerValues(1, [
					{quote: 1600000, valdate: '2016-01-07'},
					{quote: 1900000, valdate: '2016-01-10'},
					{quote: 2000000, valdate: '2016-01-11'}
				])
				.then(() => {
					return dbConnection.addPlayerValues(2, [
						{quote: 2600000, valdate: '2015-11-07'},
						{quote: 2800000, valdate: '2015-11-09'},
						{quote: 2900000, valdate: '2015-11-10'}
					]);
				})
				.then(() => {
					return dbConnection.addPlayerValues(10, [
						{quote: 4600000, valdate: '2016-02-07'},
						{quote: 4700000, valdate: '2016-02-08'	}
					]);
				})
				.then(() => dbConnection.getAllPlayerValues())
				.should.eventually.have.length(8);
		});

		it('should return an empty array of market values', () => {
			return dbConnection.getAllPlayerValues()
			.should.eventually.have.length(0);
		})
	});

	describe('api', () => {
		it('should return 5 market values for player with id 1 and 4 market values for player with id 2 and 2 market values for player with id 10', done => {
			seneca.act({
				role: 'database',
				playerValues: 'add',
				data: {
					playerId: 1,
					values: [
						{quote: 1600000, valdate: '2016-01-07'},
						{quote: 1700000, valdate: '2016-01-08'},
						{quote: 1800000, valdate: '2016-01-09'},
						{quote: 1900000, valdate: '2016-01-10'},
						{quote: 2000000, valdate: '2016-01-11'}
					]
				}
			}, (err, res) => {
				if(err)
					done(err);
				seneca.act({
					role: 'database',
					playerValues: 'add',
					data: {
						playerId: 2,
						values: [
							{quote: 2600000, valdate: '2015-11-07'},
							{quote: 2700000, valdate: '2015-11-08'},
							{quote: 2800000, valdate: '2015-11-09'},
							{quote: 2900000, valdate: '2015-11-10'}
						]
					}
				}, (err, res) => {
					if(err)
						done(err);
					seneca.act({
						role: 'database',
						playerValues: 'add',
						data: {
							playerId: 10,
							values: [
								{quote: 4600000, valdate: '2016-02-07'},
								{quote: 4700000, valdate: '2016-02-08'}
							]
						}
					}, (err, res) => {
						if(err)
							done(err);
						seneca.act({
							role: 'database',
							playerValues: 'getAll'
						}, (err, res) => {
							if(err)
								done(err);
							res.should.deep.eq([
								{pid: 1, value: 1600000, valdate: moment('2016-01-07', "YYYY-MM-DD").toDate()},
								{pid: 1, value: 1700000, valdate: moment('2016-01-08', "YYYY-MM-DD").toDate()},
								{pid: 1, value: 1800000, valdate: moment('2016-01-09', "YYYY-MM-DD").toDate()},
								{pid: 1, value: 1900000, valdate: moment('2016-01-10', "YYYY-MM-DD").toDate()},
								{pid: 1, value: 2000000, valdate: moment('2016-01-11', "YYYY-MM-DD").toDate()},
								{pid: 2, value: 2600000, valdate: moment('2015-11-07', "YYYY-MM-DD").toDate()},
								{pid: 2, value: 2700000, valdate: moment('2015-11-08', "YYYY-MM-DD").toDate()},
								{pid: 2, value: 2800000, valdate: moment('2015-11-09', "YYYY-MM-DD").toDate()},
								{pid: 2, value: 2900000, valdate: moment('2015-11-10', "YYYY-MM-DD").toDate()},
								{pid: 10, value: 4600000, valdate: moment('2016-02-07', "YYYY-MM-DD").toDate()},
								{pid: 10, value: 4700000, valdate: moment('2016-02-08', "YYYY-MM-DD").toDate()}
							]);
							done();
						});
					});
				});
			});
		});

		it('should return an array of market values with length 8', done => {

			seneca.act({
				role: 'database',
				playerValues: 'add',
				data: {
					playerId: 1,
					values: [
						{quote: 1600000, valdate: '2016-01-07'},
						{quote: 1700000, valdate: '2016-01-08'},
						{quote: 2000000, valdate: '2016-01-11'}
					]
				}
			}, (err, res) => {
				if(err)
					done(err);
				seneca.act({
					role: 'database',
					playerValues: 'add',
					data: {
						playerId: 2,
						values: [
							{quote: 2600000, valdate: '2015-11-07'},
							{quote: 2800000, valdate: '2015-11-09'},
							{quote: 2900000, valdate: '2015-11-10'}
						]
					}
				}, (err, res) => {
					if(err)
						done(err);
					seneca.act({
						role: 'database',
						playerValues: 'add',
						data: {
							playerId: 10,
							values: [
								{quote: 4600000, valdate: '2016-02-07'},
								{quote: 4700000, valdate: '2016-02-08'}
							]
						}
					}, (err, res) => {
						if(err)
							done(err);
						seneca.act({
							role: 'database',
							playerValues: 'getAll'
						}, (err, res) => {
							if(err)
								done(err);
							res.should.have.length(8);
							done();
						});
					});
				});
			});
		});

		it('should return an empty array of market values', done => {
			seneca.act({
				role: 'database',
				playerValues: 'getAll'
			}, (err, res) => {
				if(err)
					done(err);
				res.should.have.length(0);
				done();
			});
		})
	});
});

describe('addPlayerStats', () => {
    const playerStatsOne = {
        playerId: 2,
        gameDay: 2,
        seasonStart: 2015,
        goals: 0,
        opponentId: 1,
        home: true,
        subOut: 89,
        points: 8
    };
    const playerStatsOneResult = Object.assign({}, playerStatsOne, {
        cards: null,
        subIn: null,
        gameDay: undefined,
        seasonStart: undefined,
        opponentId: undefined,
        gameschedule: {
            gameDay: 2,
            guestClubId: 1,
            seasonStart: 2015,
            homeClubId: 8,
            homeScore: 1,
            guestScore: 2
        }
    });
    delete playerStatsOneResult.gameDay;
    delete playerStatsOneResult.seasonStart;
    delete playerStatsOneResult.opponentId;

    describe('library', () => {
		it('should add stats without player being subbed in and not getting a card for football player with id 2', () => {
			return dbConnection.addPlayerStats(playerStatsOne)
				.then(() => {
					return dbConnection.getPlayerStats(2);
				}).should.eventually.eql([
                    playerStatsOneResult
				]);
		});

		it('should add stats without player being subbed out and getting a red card for football player with id 5', () => {
			return dbConnection.addPlayerStats(
			    Object.assign({}, playerStatsOne, {
			        playerId: 5,
                    cards: 'red',
                    subOut: undefined
                })
            )
				.then(() => {
					return dbConnection.getPlayerStats(5);
				}).should.eventually.eql([
                    Object.assign({}, playerStatsOneResult, {
                        playerId: 5,
                        cards: 'red',
                        subOut: null
                    })
                ]);
		});

		it('should add stats without player being subbed out for football player with id 5', () => {
			return dbConnection.addPlayerStats(
				Object.assign({}, playerStatsOne, {
					playerId: 5,
					cards: 'red',
					subOut: undefined,
					opponentId: 17,
					home: false
				})
			)
				.then(() => {
					return dbConnection.getPlayerStats(5);
				}).should.eventually.eql([
					Object.assign({}, playerStatsOneResult, {
						playerId: 5,
						cards: 'red',
						subOut: null,
						home: false,
						gameschedule: {
							gameDay: 2,
							guestClubId: 7,
							seasonStart: 2015,
							homeClubId: 17,
							homeScore: 0,
							guestScore: 4
						}
					})
				]);
		});

		describe('parameter testing', () => {
			it('should throw an error because playerId is undefined', () => {
				return dbConnection.addPlayerStats(Object.assign({}, playerStatsOne, {
					playerId: undefined
				})).should.eventually.be.rejectedWith(Error, 'Error: Parameter playerId is not specified or is not a number');
			});

			it('should throw an error because playerId is not a number', () => {
				return dbConnection.addPlayerStats(Object.assign({}, playerStatsOne, {
					playerId: "1"
				})).should.eventually.be.rejectedWith(Error, 'Error: Parameter playerId is not specified or is not a number');
			});

			it('should throw an error because gameDay is undefined', () => {
				return dbConnection.addPlayerStats(Object.assign({}, playerStatsOne, {
					gameDay: undefined
				})).should.eventually.be.rejectedWith(Error, 'Error: Parameter gameDay is not specified or is not a number');
			});

			it('should throw an error because gameDay is not a number', () => {
				return dbConnection.addPlayerStats(Object.assign({}, playerStatsOne, {
					gameDay: "1"
				})).should.eventually.be.rejectedWith(Error, 'Error: Parameter gameDay is not specified or is not a number');
			});

			it('should throw an error because seasonStart is undefined', () => {
				return dbConnection.addPlayerStats(Object.assign({}, playerStatsOne, {
					seasonStart: undefined
				})).should.eventually.be.rejectedWith(Error, 'Error: Parameter seasonStart is not specified or is not a number');
			});

			it('should throw an error because seasonStart is not a number', () => {
				return dbConnection.addPlayerStats(Object.assign({}, playerStatsOne, {
					seasonStart: "1"
				})).should.eventually.be.rejectedWith(Error, 'Error: Parameter seasonStart is not specified or is not a number');
			});

			it('should throw an error because goals is undefined', () => {
				return dbConnection.addPlayerStats(Object.assign({}, playerStatsOne, {
					goals: undefined
				})).should.eventually.be.rejectedWith(Error, 'Error: Parameter goals is not specified or is not a number');
			});

			it('should throw an error because goals is not a number', () => {
				return dbConnection.addPlayerStats(Object.assign({}, playerStatsOne, {
					goals: "1"
				})).should.eventually.be.rejectedWith(Error, 'Error: Parameter goals is not specified or is not a number');
			});

			it('should throw an error because opponentId is undefined', () => {
				return dbConnection.addPlayerStats(Object.assign({}, playerStatsOne, {
					opponentId: undefined
				})).should.eventually.be.rejectedWith(Error, 'Error: Parameter opponentId is not specified or is not a number');
			});

			it('should throw an error because opponentId is not a number', () => {
				return dbConnection.addPlayerStats(Object.assign({}, playerStatsOne, {
					opponentId: "1"
				})).should.eventually.be.rejectedWith(Error, 'Error: Parameter opponentId is not specified or is not a number');
			});

			it('should throw an error because home is undefined', () => {
				return dbConnection.addPlayerStats(Object.assign({}, playerStatsOne, {
					home: undefined
				})).should.eventually.be.rejectedWith(Error, 'Error: Parameter home is not specified or is not a boolean');
			});

			it('should throw an error because home is not a boolean', () => {
				return dbConnection.addPlayerStats(Object.assign({}, playerStatsOne, {
					home: "1"
				})).should.eventually.be.rejectedWith(Error, 'Error: Parameter home is not specified or is not a boolean');
			});

			it('should throw an error because subIn is not a number', () => {
				return dbConnection.addPlayerStats(Object.assign({}, playerStatsOne, {
					subIn: "1"
				})).should.eventually.be.rejectedWith(Error, 'Error: Parameter subIn is not a number');
			});

			it('should throw an error because subOut is not a number', () => {
				return dbConnection.addPlayerStats(Object.assign({}, playerStatsOne, {
					subOut: "1"
				})).should.eventually.be.rejectedWith(Error, 'Error: Parameter subOut is not a number');
			});

			it('should throw an error because points is not a number', () => {
				return dbConnection.addPlayerStats(Object.assign({}, playerStatsOne, {
					points: "1"
				})).should.eventually.be.rejectedWith(Error, 'Error: Parameter points is not a number');
			});

			it('should throw an error because subIn is not a number', () => {
				return dbConnection.addPlayerStats({
						playerId: 1,
						gameDay: 34,
						seasonStart: 2014,
						goals: 2,
						clubId: 1000,
						opponentId: 8,
						home: false,
						homeScore: 0,
						awayScore: 0,
						subIn: "15",
						points: 8,
						cards: 'red'
					})
					.should.eventually.be.rejectedWith(Error, 'Error: Parameter subIn is not a number');
			});

			it('should throw an error because subOut is not a number', () => {
				return dbConnection.addPlayerStats({
						playerId: 1,
						gameDay: 34,
						seasonStart: 2014,
						goals: 2,
						clubId: 1000,
						opponentId: 8,
						home: false,
						homeScore: 0,
						awayScore: 0,
						subOut: "80",
						points: 8,
						cards: 'red'
					})
					.should.eventually.be.rejectedWith(Error, 'Error: Parameter subOut is not a number');
			});

			it('should throw an error because cards is not yellow, red or yellow-red', () => {
				return dbConnection.addPlayerStats(Object.assign({}, playerStatsOne, {
					cards: "Gelb"
				})).should.eventually.be.rejectedWith(Error, 'Parameter cards must be either yellow, yellow-red or red');
			});
		});

		describe('foreign key testing', () => {
			it('should throw an error because playerId is non-existent', () => {
				return dbConnection.addPlayerStats({
						playerId: 100000,
						gameDay: 34,
						seasonStart: 2014,
						goals: 2,
						clubId: 3,
						opponentId: 8,
						home: false,
						homeScore: 0,
						awayScore: 0,
						subIn: 15,
						points: 8,
						cards: 'red'
					})
					.should.eventually.be.rejectedWith(Error);
			});

			it('should throw an error because club id is non-existent', () => {
				return dbConnection.addPlayerStats({
						playerId: 1,
						gameDay: 34,
						seasonStart: 2014,
						goals: 2,
						clubId: 1000,
						opponentId: 8,
						home: false,
						homeScore: 0,
						awayScore: 0,
						subIn: 15,
						points: 8,
						cards: 'red'
					})
					.should.eventually.be.rejectedWith(Error);
			});

			it('should throw an error because opponent id is non-existent', () => {
				return dbConnection.addPlayerStats({
						playerId: 1,
						gameDay: 34,
						seasonStart: 2014,
						goals: 2,
						clubId: 1,
						opponentId: 1000,
						home: false,
						homeScore: 0,
						awayScore: 0,
						subIn: 15,
						points: 8,
						cards: 'red'
					})
					.should.eventually.be.rejectedWith(Error);
			});
		});
	});

	describe('api', () => {

		it('should add stats without player being subbed in and not getting a card for football player with id 2', function(done) {
			this.timeout(10000);
			seneca.error(done);
			seneca.act({
				role: 'database',
				playerStats: 'add',
				data: playerStatsOne
			}, (err, res) => {
				if(err) return done(err);
				seneca.act({
					role: 'database',
					playerStats: 'get',
					data: {
						playerId: 2
					}
				}, (err, res) => {
					if(err) return done(err);
					res.should.deep.eql([playerStatsOneResult]);
					return done();
				});
			});
		});

		it('should add stats without player being subbed out and getting a red card for football player with id 5', function(done) {
			this.timeout(10000);
			seneca.error(done);
			seneca.act({
				role: 'database',
				playerStats: 'add',
				data: Object.assign({}, playerStatsOne, {
                    playerId: 5,
                    cards: 'red',
                    subOut: undefined
                })
			}, (err, res) => {
				if(err) return done(err);
				seneca.act({
					role: 'database',
					playerStats: 'get',
					data: {
						playerId: 5
					}
				}, (err, res) => {
					if(err) done(err);
					res.should.eql([Object.assign({}, playerStatsOneResult, {
                        playerId: 5,
                        cards: 'red',
                        subOut: null
                    })]);
					return done();
				});
			});
		});

	});
});

describe('getPlayerStats', () => {
	const oneStat = {
		playerId: 2,
		gameDay: 2,
		seasonStart: 2015,
		goals: 0,
		clubId: 1,
		opponentId: 13,
		home: true,
		homeScore: 3,
		awayScore: 2,
		subOut: 89,
		points: 8
	};
	const returnOneStat = {
		playerId: 2,
		goals: 0,
		home: true,
		subOut: 89,
		points: 8
	};

	describe('library', () => {

		it('should return array of player stats which contain all properties: playerId, gameschedule, goals, home, subIn, subOut, cards, points', () => {
			return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
				home: false,
				subOut: undefined
			}))
			.then(() => {
				return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
					gameDay: 3,
					home: true,
					points: 0,
					goals: 3,
					opponentId: 6,
					homeScore: 3,
					awayScore: 0
				}));
			})
			.then(() => {
				return dbConnection.addPlayerStats(oneStat);
			})
			.then(() => {
				return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
					playerId: 3,
					clubId: 2,
					subIn: 15,
					gameDay: 1,
					opponentId: 14
				}));
			})
			.then(() => {
				return dbConnection.getPlayerStats(2);
			})
			.should.eventually.all.contain.keys('playerId', 'gameschedule', 'goals', 'home', 'subIn', 'subOut', 'cards', 'points');
		});

		it('should have length 3', () => {
			return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
					gameDay: 3,
					opponentId: 15,
					home: false,
					subOut: undefined
				}))
				.then(() => {
					return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
						gameDay: 1,
						home: true,
						opponentId: 8,
						points: 0,
						goals: 3
					}));
				})
				.then(() => {
					return dbConnection.addPlayerStats(oneStat);
				})
				.then(() => {
					return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
						playerId: 3,
						subIn: 15
					}));
				})
				.then(() => {
					return dbConnection.getPlayerStats(2);
				})
				.should.eventually.have.length(3);
		});

		it('should return all player stats for season 2015', () => {
			return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
					gameDay: 3,
					home: false,
					subOut: undefined,
					opponentId: 14
				}))
				.then(() => {
					return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
						gameDay: 1,
						opponentId: 18,
						seasonStart: 2016,
						home: true,
						points: 0,
						goals: 3,
						homeScore: 0,
						awayScore: 0
					}));
				})
				.then(() => {
					return dbConnection.addPlayerStats(oneStat);
				})
				.then(() => {
					return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
						playerId: 3,
						subIn: 15,
						seasonStart: 2015
					}));
				})
				.then(() => {
					return dbConnection.getPlayerStats(2, 2015);
				})
				.should.eventually.eql([
					Object.assign({}, returnOneStat, {
						home: false,
						cards: null,
						subIn: null,
						subOut: null,
						gameschedule: {
							gameDay: 3,
							seasonStart: 2015,
							homeScore: 3,
							guestScore: 0,
							homeClubId: 11,
							guestClubId: 14
						}
					}),
					Object.assign({}, returnOneStat, {
						subIn: null,
						cards: null,
						gameschedule: {
							gameDay: 2,
							seasonStart: 2015,
							homeScore: 3,
							guestScore: 2,
							homeClubId: 16,
							guestClubId: 13
						}
					})
				]);
		});

		it('should return all player stats for season 2016 and game day 1', () => {
			return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
					gameDay: 1,
					home: false,
					subOut: undefined,
					seasonStart: 2016,
					opponentId: 18
				}))
				.then(() => {
					return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
						gameDay: 1,
						home: true,
						points: 0,
						goals: 3,
						homeScore: 0,
						awayScore: 0,
						opponentId: 12
					}));
				})
				.then(() => {
					return dbConnection.addPlayerStats(oneStat);
				})
				.then(() => {
					return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
						playerId: 3,
						gameDay: 1,
						subIn: 15,
						seasonStart: 2016,
						opponentId: 18
					}));
				})
				.then(() => {
					return dbConnection.getPlayerStats(2, 2016, 1);
				})
				.should.eventually.eql([
					Object.assign({}, returnOneStat, {
						home: false,
						subOut: null,
						subIn: null,
						cards: null,
						gameschedule: {
							gameDay: 1,
							seasonStart: 2016,
							homeScore: 1,
							guestScore: 1,
							homeClubId: 6,
							guestClubId: 18
						}
					})
				]);
		});

		it('should throw an error when getting stats for game day 3 without mentioning the season start', () => {
			return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
				gameDay: 1,
				home: false,
				subOut: undefined,
				seasonStart: 2016,
				opponentId: 18
			}))
				.then(() => {
					return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
						gameDay: 1,
						home: true,
						points: 0,
						goals: 3,
						homeScore: 0,
						awayScore: 0,
						opponentId: 12
					}));
				})
				.then(() => {
					return dbConnection.addPlayerStats(oneStat);
				})
				.then(() => {
					return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
						playerId: 3,
						gameDay: 1,
						subIn: 15,
						seasonStart: 2016,
						opponentId: 18
					}));
				})
				.then(() => {
					return dbConnection.getPlayerStats(2, undefined, 3);
				})
				.should.eventually.be.rejectedWith(Error, 'Error: The parameter gameDay can only be given together with the parameter seasonStart');
		});

		it('should throw an error when season start is not a number', () => {
			return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
				gameDay: 1,
				home: false,
				subOut: undefined,
				seasonStart: 2016,
				opponentId: 18
			}))
				.then(() => {
					return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
						gameDay: 1,
						home: true,
						points: 0,
						goals: 3,
						homeScore: 0,
						awayScore: 0,
						opponentId: 12
					}));
				})
				.then(() => {
					return dbConnection.addPlayerStats(oneStat);
				})
				.then(() => {
					return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
						playerId: 3,
						gameDay: 1,
						subIn: 15,
						seasonStart: 2016,
						opponentId: 18
					}));
				})
				.then(() => {
					return dbConnection.getPlayerStats(2, "2016");
				})
				.should.eventually.be.rejectedWith(Error, 'Error: seasonStart is not a number');
		});

		it('should throw an error when game day is not a number', () => {
			return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
				gameDay: 1,
				home: false,
				subOut: undefined,
				seasonStart: 2016,
				opponentId: 18
			}))
				.then(() => {
					return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
						gameDay: 1,
						home: true,
						points: 0,
						goals: 3,
						homeScore: 0,
						awayScore: 0,
						opponentId: 12
					}));
				})
				.then(() => {
					return dbConnection.addPlayerStats(oneStat);
				})
				.then(() => {
					return dbConnection.addPlayerStats(Object.assign({}, oneStat, {
						playerId: 3,
						gameDay: 1,
						subIn: 15,
						seasonStart: 2016,
						opponentId: 18
					}));
				})
				.then(() => {
					return dbConnection.getPlayerStats(2, 2016, "3");
				})
				.should.eventually.be.rejectedWith(Error, 'Error: One of the parameter gameDay or seasonStart is not a number');
		});
	});

	describe('api', () => {

		it('should return array of player stats which contain all properties: playerId, gameschedule, goals, home, subIn, subOut, cards, points', function(done) {
			seneca.error(done);
			seneca.act({
					role: 'database',
					playerStats: 'add',
					data: Object.assign({}, oneStat, {
                        home: false,
                        subOut: undefined
                    })
				}, (err, res) => {
				if(err) return done(err);

				seneca.act({
					role: 'database',
					playerStats: 'add',
					data: Object.assign({}, oneStat, {
                        gameDay: 3,
                        home: true,
                        points: 0,
                        goals: 3,
                        opponentId: 6,
                        homeScore: 3,
                        awayScore: 0
                    })
				}, (err, res) => {
					if(err) return done(err);

					seneca.act({
						role: 'database',
						playerStats: 'add',
						data: oneStat
					}, (err, res) => {
						if(err) return done(err);

						seneca.act({
							role: 'database',
							playerStats: 'add',
							data: Object.assign({}, oneStat, {
                                playerId: 3,
                                clubId: 2,
                                subIn: 15,
                                gameDay: 1,
                                opponentId: 14
                            })
						}, (err, res) => {
							if(err) return done(err);

							seneca.act({
								role: 'database',
								playerStats: 'get',
								data: {
									playerId: 2
								}
							}, (err, res) => {
								if(err) return done(err);
								res.should.all.contain.keys('playerId', 'gameschedule', 'goals', 'home', 'subIn', 'subOut', 'cards', 'points');
								return done();
							});
						});
					});
				});
			})
		});

		it('should have length 3', function(done) {
			seneca.error(done);
			seneca.act({
				role: 'database',
				playerStats: 'add',
				data: Object.assign({}, oneStat, {
                    gameDay: 3,
                    opponentId: 15,
                    home: false,
                    subOut: undefined
                })
			}, (err, res) => {
				if(err) return done(err);

				seneca.act({
					role: 'database',
					playerStats: 'add',
					data: Object.assign({}, oneStat, {
                        gameDay: 1,
                        home: true,
                        opponentId: 8,
                        points: 0,
                        goals: 3
                    })
				}, (err, res) => {
					if(err) return done(err);

					seneca.act({
						role: 'database',
						playerStats: 'add',
						data: oneStat
					}, (err, res) => {
						if(err) return done(err);

						seneca.act({
							role: 'database',
							playerStats: 'add',
							data: Object.assign({}, oneStat, {
                                playerId: 3,
                                subIn: 15
                            })
						}, (err, res) => {
							if(err) return done(err);

							seneca.act({
								role: 'database',
								playerStats: 'get',
								data: {
									playerId: 2
								}
							}, (err, res) => {
								if(err) return done(err);
								res.should.have.length(3);
								return done();
							});
						});
					});
				});
			})
		});

		it('should return all player stats for season 2015', function(done) {
			seneca.error(done);
			seneca.act({
				role: 'database',
				playerStats: 'add',
				data: Object.assign({}, oneStat, {
                    gameDay: 3,
                    home: false,
                    subOut: undefined,
                    opponentId: 14
                })
			}, (err, res) => {
				if(err) return done(err);

				seneca.act({
					role: 'database',
					playerStats: 'add',
					data: Object.assign({}, oneStat, {
                        gameDay: 1,
                        opponentId: 18,
                        seasonStart: 2016,
                        home: true,
                        points: 0,
                        goals: 3,
                        homeScore: 0,
                        awayScore: 0
                    })
				}, (err, res) => {
					if(err) return done(err);

					seneca.act({
						role: 'database',
						playerStats: 'add',
						data: oneStat
					}, (err, res) => {
						if(err) return done(err);
						seneca.act({
							role: 'database',
							playerStats: 'add',
							data: Object.assign({}, oneStat, {
                                playerId: 3,
                                subIn: 15,
                                seasonStart: 2015
                            })
						}, (err, res) => {
							if(err) return done(err);

							seneca.act({
								role: 'database',
								playerStats: 'get',
								data: {
									playerId: 2,
									seasonStart: 2015
								}
							}, (err, res) => {
								if(err) return done(err);
								res.should.eql([
                                    Object.assign({}, returnOneStat, {
                                        home: false,
                                        cards: null,
                                        subIn: null,
                                        subOut: null,
                                        gameschedule: {
                                            gameDay: 3,
                                            seasonStart: 2015,
                                            homeScore: 3,
                                            guestScore: 0,
                                            homeClubId: 11,
                                            guestClubId: 14
                                        }
                                    }),
                                    Object.assign({}, returnOneStat, {
                                        subIn: null,
                                        cards: null,
                                        gameschedule: {
                                            gameDay: 2,
                                            seasonStart: 2015,
                                            homeScore: 3,
                                            guestScore: 2,
                                            homeClubId: 16,
                                            guestClubId: 13
                                        }
                                    })
								]);
								return done();
							});
						});
					});
				});
			});

		});

		it('should return all player stats for season 2016 and game day 1', function(done) {

			seneca.error(done);
			seneca.act({
				role: 'database',
				playerStats: 'add',
				data: Object.assign({}, oneStat, {
                    gameDay: 1,
                    home: false,
                    subOut: undefined,
                    seasonStart: 2016,
                    opponentId: 18
                })
			}, (err, res) => {
				if(err) return done(err);

				seneca.act({
					role: 'database',
					playerStats: 'add',
					data: Object.assign({}, oneStat, {
                        gameDay: 1,
                        home: true,
                        points: 0,
                        goals: 3,
                        homeScore: 0,
                        awayScore: 0,
                        opponentId: 12
                    })
				}, (err, res) => {
					if(err) return done(err);

					seneca.act({
						role: 'database',
						playerStats: 'add',
						data: oneStat
					}, (err, res) => {
						if(err) return done(err);
						seneca.act({
							role: 'database',
							playerStats: 'add',
							data: Object.assign({}, oneStat, {
                                playerId: 3,
                                gameDay: 1,
                                subIn: 15,
                                seasonStart: 2016,
                                opponentId: 18
                            })
						}, (err, res) => {
							if(err) return done(err);

							seneca.act({
								role: 'database',
								playerStats: 'get',
								data: {
									playerId: 2,
									seasonStart: 2016,
									gameDay: 1
								}
							}, (err, res) => {
								if(err) return done(err);
								res.should.eql([
                                    Object.assign({}, returnOneStat, {
                                        home: false,
                                        subOut: null,
                                        subIn: null,
                                        cards: null,
                                        gameschedule: {
                                            gameDay: 1,
                                            seasonStart: 2016,
                                            homeScore: 1,
                                            guestScore: 1,
                                            homeClubId: 6,
                                            guestClubId: 18
                                        }
                                    })
								]);
								return done();
							});
						});
					});
				});
			});
		});

	});
});

describe('addGame', () => {
	const oneGame = {
		gameDay: 2,
		seasonStart: 2017,
		homeScore: 1,
		guestScore: 2,
		homeClubId: 1,
		guestClubId: 2
	};

	describe('library', () => {
		it('should add the given game', () => {
			return dbConnection.addGame(oneGame)
				.then(() => {
					return dbConnection.getGames(2017);
				}).should.eventually.all.contain.property('gameDay', 2)
                    .and.all.contain.property('seasonStart', 2017)
                    .and.all.contain.property('homeScore', 1)
                    .and.all.contain.property('guestScore', 2)
                    .and.all.contain.property('homeClubId', 1)
                    .and.all.contain.property('guestClubId', 2);
		});

		it('should add the given game without scores', () => {
			return dbConnection.addGame(Object.assign({}, oneGame, { homeScore: undefined, guestScore: undefined }))
				.then(() => {
					return dbConnection.getGames(2017);
				}).should.eventually.all.contain.property('gameDay', 2)
                    .and.all.contain.property('seasonStart', 2017)
                    .and.all.contain.property('homeScore', null)
                    .and.all.contain.property('guestScore', null)
                    .and.all.contain.property('homeClubId', 1)
                    .and.all.contain.property('guestClubId', 2);
		});

		describe('parameter testing', () => {
			it('should throw an error because gameDay is undefined', () => {
				return dbConnection.addGame(Object.assign({}, oneGame, { gameDay: undefined }))
					.then(() => {
						return dbConnection.getGames(2016);
					}).should.eventually.be.rejectedWith(Error, 'Error: Parameter gameDay is not specified or is not a number');
			});

			it('should throw an error because gameDay is not a number', () => {
				return dbConnection.addGame(Object.assign({}, oneGame, { gameDay: "2" }))
					.then(() => {
						return dbConnection.getGames(2016);
					}).should.eventually.be.rejectedWith(Error, 'Error: Parameter gameDay is not specified or is not a number');
			});

			it('should throw an error because seasonStart is undefined', () => {
				return dbConnection.addGame(Object.assign({}, oneGame, { seasonStart: undefined }))
					.then(() => {
						return dbConnection.getGames(2016);
					}).should.eventually.be.rejectedWith(Error, 'Error: Parameter seasonStart is not specified or is not a number');
			});

			it('should throw an error because seaonsStart is not a number', () => {
				return dbConnection.addGame(Object.assign({}, oneGame, { seasonStart: "2" }))
					.then(() => {
						return dbConnection.getGames(2016);
					}).should.eventually.be.rejectedWith(Error, 'Error: Parameter seasonStart is not specified or is not a number');
			});

			it('should throw an error because homeClubId is undefined', () => {
				return dbConnection.addGame(Object.assign({}, oneGame, { homeClubId: undefined }))
					.then(() => {
						return dbConnection.getGames(2016);
					}).should.eventually.be.rejectedWith(Error, 'Error: Parameter homeClubId is not specified or is not a number');
			});

			it('should throw an error because homeClubId is not a number', () => {
				return dbConnection.addGame(Object.assign({}, oneGame, { homeClubId: "2" }))
					.then(() => {
						return dbConnection.getGames(2016);
					}).should.eventually.be.rejectedWith(Error, 'Error: Parameter homeClubId is not specified or is not a number');
			});

			it('should throw an error because guestClubId is undefined', () => {
				return dbConnection.addGame(Object.assign({}, oneGame, { guestClubId: undefined }))
					.then(() => {
						return dbConnection.getGames(2016);
					}).should.eventually.be.rejectedWith(Error, 'Error: Parameter guestClubId is not specified or is not a number');
			});

			it('should throw an error because guestClubId is not a number', () => {
				return dbConnection.addGame(Object.assign({}, oneGame, { guestClubId: "2" }))
					.then(() => {
						return dbConnection.getGames(2016);
					}).should.eventually.be.rejectedWith(Error, 'Error: Parameter guestClubId is not specified or is not a number');
			});

			it('should throw an error because homeScore is not a number', () => {
				return dbConnection.addGame(Object.assign({}, oneGame, { homeScore: "2" }))
					.then(() => {
						return dbConnection.getGames(2016);
					}).should.eventually.be.rejectedWith(Error, 'Error: Parameter homeScore is not a number');
			});

			it('should throw an error because guestScore is not a number', () => {
				return dbConnection.addGame(Object.assign({}, oneGame, { guestScore: "2" }))
					.then(() => {
						return dbConnection.getGames(2016);
					}).should.eventually.be.rejectedWith(Error, 'Error: Parameter guestScore is not a number');
			});
		});

		describe('foreign key testing', () => {
			it('should throw an error because homeClubId does not exist', () => {
				return dbConnection.addGame(Object.assign({}, oneGame, { homeClubId: 2000 }))
					.should.eventually.be.rejectedWith(Error);
			});

			it('should throw an error because guestClubId does not exist', () => {
				return dbConnection.addGame(Object.assign({}, oneGame, { guestClubId: 2000 }))
					.should.eventually.be.rejectedWith(Error);
			});
		});
	});

	describe('api', () => {
		it('should add the given game', function(done) {
			seneca.error(done);
			seneca.act({
				role: 'database',
				game: 'add',
				data: oneGame
			}, (err, res) => {
				if(err) return done(err);
				seneca.act({
					role: 'database',
					games: 'get',
					data: {
						seasonStart: 2017
					}
				}, (err, res) => {
					if(err) return done(err);
					res.should.all.contain.property('gameDay', 2)
                        .and.all.contain.property('seasonStart', 2017)
                        .and.all.contain.property('homeScore', 1)
                        .and.all.contain.property('guestScore', 2)
                        .and.all.contain.property('homeClubId', 1)
                        .and.all.contain.property('guestClubId', 2);
					done();
				});
			});
		});

		it('should add the given game without scores', function(done) {
			seneca.error(done);
			seneca.act({
				role: 'database',
				game: 'add',
				data: Object.assign({}, oneGame, { homeScore: undefined, guestScore: undefined })
			}, (err, res) => {
				if(err) return done(err);
				seneca.act({
					role: 'database',
					games: 'get',
					data: {
						seasonStart: 2017
					}
				}, (err, res) => {
					if(err) return done(err);
					res.should.all.contain.property('gameDay', 2)
                        .and.all.contain.property('seasonStart', 2017)
                        .and.all.contain.property('homeScore', null)
                        .and.all.contain.property('guestScore', null)
                        .and.all.contain.property('homeClubId', 1)
                        .and.all.contain.property('guestClubId', 2);
					done();
				});
			});
		});
	});
});

describe('getGames', () => {
	const oneGame = {
		gameDay: 2,
		seasonStart: 2017,
		homeScore: 1,
		guestScore: 2,
		homeClubId: 1,
		guestClubId: 2
	};
	describe('library', () => {
		it('should return two games for season 2017', () => {
			return dbConnection.addGame(oneGame)
				.then(() => {
					return dbConnection.addGame({
						gameDay: 3,
						seasonStart: 2017,
						homeScore: 1,
						guestScore: 0,
						homeClubId: 3,
						guestClubId: 4
					});
				})
				.then(() => {
					return dbConnection.getGames(2017);
				}).should.eventually.eql([
					Object.assign({}, oneGame, {
						id: 29
					}),
					{
						gameDay: 3,
						seasonStart: 2017,
						homeScore: 1,
						guestScore: 0,
						homeClubId: 3,
						guestClubId: 4,
						id: 30
					}
				]);
		});

		it('should return two games for gameday 3 in season 2017', () => {
			return dbConnection.addGame(oneGame)
				.then(() => {
					return dbConnection.addGame({
						gameDay: 3,
						seasonStart: 2017,
						homeScore: 1,
						guestScore: 0,
						homeClubId: 3,
						guestClubId: 4
					});
				})
				.then(() => {
					return dbConnection.addGame({
						gameDay: 3,
						seasonStart: 2017,
						homeScore: 0,
						guestScore: 0,
						homeClubId: 6,
						guestClubId: 7
					});
				})
				.then(() => {
					return dbConnection.getGames(2017, 3);
				}).should.eventually.eql([
					{
						gameDay: 3,
						seasonStart: 2017,
						homeScore: 1,
						guestScore: 0,
						homeClubId: 3,
						guestClubId: 4,
						id: 30
					},
					{
						gameDay: 3,
						seasonStart: 2017,
						homeScore: 0,
						guestScore: 0,
						homeClubId: 6,
						guestClubId: 7,
						id: 31
					}
				]);
		});

		it('should return one game for gameday 3 in season 2017 and opponent team with id 7', () => {
			return dbConnection.addGame(oneGame)
				.then(() => {
					return dbConnection.addGame({
						gameDay: 3,
						seasonStart: 2017,
						homeScore: 1,
						guestScore: 0,
						homeClubId: 3,
						guestClubId: 4
					});
				})
				.then(() => {
					return dbConnection.addGame({
						gameDay: 3,
						seasonStart: 2017,
						homeScore: 0,
						guestScore: 0,
						homeClubId: 6,
						guestClubId: 7
					});
				})
				.then(() => {
					return dbConnection.getGames(2017, 3, 7, true);
				}).should.eventually.eql([
					{
						gameDay: 3,
						seasonStart: 2017,
						homeScore: 0,
						guestScore: 0,
						homeClubId: 6,
						guestClubId: 7,
						id: 31
					}
				]);
		});

		it('should return one game for gameday 3 in season 2017 and opponent team with id 3', () => {
			return dbConnection.addGame(oneGame)
				.then(() => {
					return dbConnection.addGame({
						gameDay: 3,
						seasonStart: 2017,
						homeScore: 1,
						guestScore: 0,
						homeClubId: 3,
						guestClubId: 4
					});
				})
				.then(() => {
					return dbConnection.addGame({
						gameDay: 3,
						seasonStart: 2017,
						homeScore: 0,
						guestScore: 0,
						homeClubId: 6,
						guestClubId: 7
					});
				})
				.then(() => {
					return dbConnection.getGames(2017, 3, 3, false);
				}).should.eventually.eql([
					{
						gameDay: 3,
						seasonStart: 2017,
						homeScore: 1,
						guestScore: 0,
						homeClubId: 3,
						guestClubId: 4,
						id: 30
					}
				]);
		});

		describe('parameter testing', () => {
			it('should throw an error because seasonStart is undefined', () => {
				return dbConnection.getGames()
					.should.eventually.be.rejectedWith(Error, 'Error: Parameter seasonStart is not specified or is not a number');
			});

			it('should throw an error because seasonStart is not a number', () => {
				return dbConnection.getGames("2016")
					.should.eventually.be.rejectedWith(Error, 'Error: Parameter seasonStart is not specified or is not a number');
			});

			it('should throw an error because gameDay is not a number', () => {
				return dbConnection.getGames(2016, "3")
					.should.eventually.be.rejectedWith(Error, 'Error: Parameter gameDay is not specified or is not a number');
			});

			it('should throw an error because opponentId is not a number', () => {
				return dbConnection.getGames(2016, 3, "3", true)
					.should.eventually.be.rejectedWith(Error, 'Error: Parameter opponentId is not specified or is not a number');
			});

			it('should throw an error because isHome is undefined', () => {
				return dbConnection.getGames(2016, 3, 3)
					.should.eventually.be.rejectedWith(Error, 'Error: Parameter isHome is not specified or is not a boolean');
			});

			it('should throw an error because isHome is not a boolean', () => {
				return dbConnection.getGames(2016, 3, 3, "true")
					.should.eventually.be.rejectedWith(Error, 'Error: Parameter isHome is not specified or is not a boolean');
			});
		});
	});

	describe('api', () => {

	});
});