"use strict;"

var seneca = require('seneca');
seneca().use(require('./db-api.js'))
	.listen(10102);