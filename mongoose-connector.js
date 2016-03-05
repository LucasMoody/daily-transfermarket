var mongoose = require('mongoose'),
	newsSchema = mongoose.Schema({
		name: String,
		news: [{
			date: Date,
			newsText: String
		}]
	});