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
		it('should add for football player with id 1 the market values 1.000.000 at the 21.01.2016 and 1.200.000 at the 23.01.2016', done => {
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

		it('should throw an error for market value with the date 2016-32-01 which does not exist', done => {
			seneca.act({
				role: "database",
				playerValues: "add",
				data: {
					playerId: 1,
					values: [{quote: 1000000, valdate: '2016-32-01'}]
				}
			}, (err, res) => {
				err.should.be.an.instanceOf(Error);
				done();
			});
		});

		it('should throw an error when quote is a string', done => {
			seneca.act({
				role: "database",
				playerValues: "add",
				data: {
					playerId: 1,
					values: [{quote: "quote", valdate: '2016-01-01'}]
				}
			}, (err, res) => {
				err.should.be.an.instanceOf(Error);
				done();
			});
		});

		it('should throw an error when quote is undefined', done => {
			seneca.act({
				role: "database",
				playerValues: "add",
				data: {
					playerId: 1,
					values: [{quote: undefined, valdate: '2016-01-01'}]
				}
			}, (err, res) => {
				err.should.be.an.instanceOf(Error);
				done();
			});
		});

		it('should throw an error when id is undefined', done => {
			seneca.act({
				role: "database",
				playerValues: "add",
				data: {
					playerId: undefined,
					values: [{quote: 1000000, valdate: '2016-01-01'}]
				}
			}, (err, res) => {
				err.should.be.an.instanceOf(Error);
				done();
			});
		});

		it('should throw an error when id is not a number', done => {
			seneca.act({
				role: "database",
				playerValues: "add",
				data: {
					playerId: 'hello',
					values: [{quote: 1000000, valdate: '2016-01-01'}]
				}
			}, (err, res) => {
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




/*var seneca = require('seneca')(),
	assert = require('assert');

describe('clubs', function() {
	it('should return clubs with ids 1, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 17, 18, 62, 68, 89, 90 in this order', function (done) {
		seneca.use(require('../api/db-api.js')).act('role:database,clubs:get', function (err, res) {

			assert.equal(18, res.length);
			var expected = [
				{clubname: 'FC Bayern München', comclubid: 1},
				{clubname: 'VFL Wolfsburg', comclubid: 12},
				{clubname: 'Borussia M\'Gladbach', comclubid: 3},
				{clubname: 'Bayer 04 Leverkusen', comclubid: 8},
				{clubname: 'FC Augsburg', comclubid: 68},
				{clubname: 'FC Schalke 04', comclubid: 10},
				{clubname: 'Borussia Dortmund', comclubid: 5},
				{clubname: '1899 Hoffenheim', comclubid: 62},
				{clubname: 'Eintracht Frankfurt', comclubid: 9},
				{clubname: 'SV Werder Bremen', comclubid: 6},
				{clubname: '1. FSV Mainz 05', comclubid: 18},
				{clubname: '1. FC Köln', comclubid: 13},
				{clubname: 'VFB Stuttgart', comclubid: 14},
				{clubname: 'Hannover 96', comclubid: 17},
				{clubname: 'Hertha BSC Berlin', comclubid: 7},
				{clubname: 'Hamburger SV', comclubid: 4},
				{clubname: 'FC Ingolstadt 04', comclubid: 90},
				{clubname: 'SV Darmstadt 98', comclubid: 89}
			];
			expected = expected.sort(function(a, b) {
				return a.comclubid > b.comclubid ? 1 : -1;
			});
			res = res.sort(function(a, b) {
				return a.comclubid > b.comclubid ? 1 : -1;
			});
			for (var i = 0; res.length > i; i++) {
				assert.equal(expected[i].clubname, res[i].clubname);
				assert.equal(expected[i].comclubid, res[i].comclubid);
			}
			done();
		});
	});
});

describe('News: create', function() {
	it('should return { link: "http://www.kicker.de/newsarticle?id=1", headline: "Test headline", ' +
		'newstext: "This is a newstext, newsdate: new Date(), pid: 1" }', function(done) {
		var newsObj = {
			title: "Test headline",
			description: "This is a newstext",
			link: "http://www.kicker.de/newsarticle?id=1",
			categories: [
				'FC Bayern München',
				'VWL Wolfsburg',
				'Douglas Costa'
			],
			pubDate: new Date(),
			date: new Date()
			};
		var	expected = [{
			headline: "Test headline",
			newstext: "This is a newstext",
			link: "http://www.kicker.de/newsarticle?id=1",
			pid: 1,
			newsdate: newsObj.pubDate
		}];
		seneca.use(require('../api/db-api.js')).act({ role:'database',news:'add',data:[newsObj] }, function (err, res) {
			this.act( {role:'database',news:'get',data:1 }, function(err, res) {
				assert.equal(expected.headline, res.headline);
				assert.equal(expected.newstext, res.newstext);
				assert.equal(expected.link, res.link);
				assert.equal(expected.pid, res.pid);
				assert.equal(expected.newsdate, res.newsdate);
				done();
			});
		});
	});
});*/