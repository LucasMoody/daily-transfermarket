const dbConnection = require("../lib/db-connection.js");

dbConnection.getPlayers()
    .then(players => console.log(JSON.stringify(players)))
    .catch(err => console.error(err));