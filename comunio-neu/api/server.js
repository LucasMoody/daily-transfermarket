"use strict;"

require('seneca')({timeout: 120000}).use(require('./comunio-api.js'))
		.listen(10103);
