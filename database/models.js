var Sequelize = require('sequelize'),
	dbConfig = require('./db-config.js'),
	sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
		dialect: dbConfig.dialect,
		host: dbConfig.host,
		port: dbConfig.port
	});

var Clubs = sequelize.define('clubs', {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
	clubname: { type: Sequelize.STRING(40),  allowNull: false},
	comclubid: { type: Sequelize.INTEGER, allowNull: false }
});

var Players = sequelize.define('players', {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
	complayerid: { type: Sequelize.INTEGER, allowNull: false, unique: true },
	name: { type: Sequelize.STRING(40), allowNull: false },
	position: { type: Sequelize.STRING(40), allowNull: false },
	clubid: { type: Sequelize.INTEGER, references: { model: Clubs, key: 'id' } }
});

var MarketValues = sequelize.define('marketvalues', {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
	pid: { type: Sequelize.INTEGER, references: { model: Players, key: 'id' } }
,	value: { type: Sequelize.INTEGER, allowNull: false },
	valdate: { type: Sequelize.DATE, allowNull: false }
});

var Injuries = sequelize.define('injuries', {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
	pid: { type: Sequelize.INTEGER, references: { model: Players, key: 'id' } },
	status: { type: Sequelize.STRING(40), allowNull: false },
	statusinfo: { type: Sequelize.STRING }
});

var PlayerNews = sequelize.define('playernews', {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
	link: { type: Sequelize.STRING },
	headline: { type: Sequelize.STRING },
	newstext: { type: Sequelize.STRING },
	newsdate: { type: Sequelize.DATE, allowNull: false },
	pid: { type: Sequelize.INTEGER, references: { model: Players, key: 'id' } }
});

sequelize.sync();
//TODO catch

module.exports = {
	Clubs: Clubs,
	Players: Players,
	MarketValues: MarketValues,
	Injuries: Injuries,
	PlayerNews: PlayerNews
}
