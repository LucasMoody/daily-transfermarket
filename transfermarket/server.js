var seneca = require('seneca');
seneca().use(require('./transfermarket-api.js'))
    .listen(10101);