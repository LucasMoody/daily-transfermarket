var Clubs = sequelize.define('clubs', {
	id: { type: Sequelize.Integer, primaryKey: true, autoIncrement: true },
	clubname: { type: Sequelize.String(40),  allowNull: false},
	comclubid: { type: Sequelize.Integer, allowNull: false }
});

var 