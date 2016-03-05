var Sequelize = require('sequelize'),
	dbConfig = require('./db-config.js'),
	sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
		dialect: dbConfig.dialect,
		host: dbConfig.host,
		port: dbConfig.port,
		logging: dbConfig.logging
	});

var Clubs = sequelize.define('clubs', {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
	clubname: { type: Sequelize.STRING(40),  allowNull: false },
	comclubid: { type: Sequelize.INTEGER, allowNull: false }
},{
	collate: 'utf8_general_ci',
	charset: 'utf8'
});

var Players = sequelize.define('players', {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
	complayerid: { type: Sequelize.INTEGER, allowNull: false, unique: true },
	name: { type: Sequelize.STRING(40), allowNull: false },
	position: { type: Sequelize.STRING(40), allowNull: false },
	clubid: { type: Sequelize.INTEGER, references: { model: Clubs, key: 'id' } }
},{
	collate: 'utf8_general_ci',
	charset: 'utf8'
});

var MarketValues = sequelize.define('marketvalues', {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
	pid: { type: Sequelize.INTEGER, references: { model: Players, key: 'id' } },
	value: { type: Sequelize.INTEGER, allowNull: false },
	valdate: { type: Sequelize.DATE, allowNull: false }
},{
	collate: 'utf8_general_ci',
	charset: 'utf8'
});

var Injuries = sequelize.define('injuries', {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
	pid: { type: Sequelize.INTEGER, references: { model: Players, key: 'id' } },
	status: { type: Sequelize.STRING(40), allowNull: false },
	statusinfo: { type: Sequelize.STRING }
},{
	collate: 'utf8_general_ci',
	charset: 'utf8'
});

var PlayerNews = sequelize.define('playernews', {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
	link: { type: Sequelize.STRING },
	headline: { type: Sequelize.STRING },
	newstext: { type: Sequelize.STRING(2048) },
	newsdate: { type: Sequelize.DATE, allowNull: false },
	pid: { type: Sequelize.INTEGER, references: { model: Players, key: 'id' } }
});

/*function sync() {
	return sequelize.drop().then(function() {
		return sequelize.sync({force:true});
	});
}*/

function sync() {
	return sequelize.sync({force:true});
};
//TODO catch

module.exports = {
	Clubs: Clubs,
	Players: Players,
	MarketValues: MarketValues,
	Injuries: Injuries,
	PlayerNews: PlayerNews,
	functions: {
		sync: sync
	}
}
