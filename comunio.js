var soap = require('soap'),
    Q = require('q'),
    moment = require('moment'),
    url = 'http://www.comunio.de/soapservice.php?wsdl',
    getMarketValueForPlayerAtDate = function(playerId, date, callback) {
    var args = {playerid: playerId, date:date};
      soap.createClient(url, function(err, client) {
          if(err) {
            callback(err);
          } else {
            client.getquote(args, function(err, result) {
                if(!result.return || !result.return.$value) {
                  callback(new Error('No data for date:' + date), {});
                } else {
                  callback(err, {quote : result.return.$value, date : date});
                }
            });
          }
      });
    };

exports.getMarketValueForPlayer = function(playerId, numDays, callback) {
  var i, marketValues = [], promises = [], finished = 0, daysArray = [],
      innerFunction = function(subtractForDay) {
        var curDate = moment().subtract(subtractForDay, "days").format("YYYY-MM-DD");
        var deferred = Q.defer();
        getMarketValueForPlayerAtDate(playerId, curDate, function(err, result) {
          if (err) {
            deferred.reject(err);
          } else {
            deferred.resolve(result);  
          }
        });
        promises.push(deferred.promise);
      }
      
  for (i = 1; i<=numDays; i++) {
    innerFunction(i);
  }
  /*daysArray.forEach(function(val, idx) {
    curDate = moment().subtract(val, "days").format("YYYY-MM-DD");
    var deferred = Q.defer();
    getMarketValueForPlayerAtDate(playerId, curDate, function(err, result) {
      console.log(promises);
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(result);  
      }
    });
    promises.push(deferred.promise);
  });*/
  Q.allSettled(promises).then(function(results) {
    callback(results.filter(function(val) {
        return val.state === 'fulfilled';
      }).map(function(val) {return val.value;}).sort(function(a,b) {
          return moment(a.date).diff(moment(b.date));
      }));
  });
};


exports.getPlayersByClubId = function(id, callback) {
  var args = {name: id};
  soap.createClient(url, function(err, client) {
      client.getplayersbyclubid(args, function(err, result) {
          var player, attribute, players = [], curPlayer = {};
          for (player in result.return.item) {
            for (attribute in result.return.item[player]) {
              if (result.return.item[player][attribute].$value) {

                curPlayer[attribute] = !isNaN(parseInt(result.return.item[player][attribute].$value)) ? 
                  parseInt(result.return.item[player][attribute].$value) : result.return.item[player][attribute].$value;
              }
            }
            curPlayer.date = new Date();
            players.push(curPlayer);
            curPlayer = {};
          }
          callback(players);
      });
  });
};

exports.getCommunityMarket = function(communityId, callback) {
  var args = {name: communityId};
  soap.createClient(url, function(err, client) {
      client.getcommunitymarket(args, function(err, result) {
        var player, attribute, players = [], curPlayer = {};
          for (player in result.return.item) {
            for (attribute in result.return.item[player]) {
              if (result.return.item[player][attribute].$value) {
                curPlayer[attribute] = result.return.item[player][attribute].$value;
              }
            }
            players.push(curPlayer);
            curPlayer = {};
          }
          callback(players);
      });
  });
};

exports.getUserGameDayPoints = function(userId, gameDayId, callback) {
  var args = {userid : userId, gameday : gameDayId};
  soap.createClient(url, function(err, client) {
      client.getuserslineupbygameday(args, function(err, result) {
        console.log(result);
      });
  });
};