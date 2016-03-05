var request = require('request'),
	cheerio = require('cheerio'),
	format = require('util').format,
	moment = require('moment');
	url_ligainsider = "http://www.ligainsider.de/",
	Q = require('q');

function requestUrl(url) {
	var deferred = Q.defer();
	request(url, function(error, response, html) {
		if (error) deferred.reject("url: " + url + ", message: " + error.message);
		else deferred.resolve({response : response, html : html});
	});
	return deferred.promise;
};

function getPlayerLinks(teamLinks) {
	var promises = teamLinks.map(function(link) {
		return requestUrl(url_ligainsider + link);
	});
	return Q.allSettled(promises).then(function(requestedUrls) {
		return requestedUrls.filter(function(promiseResult) {
			if(promiseResult.state == 'fulfilled')
				return true;
			else
				return false;
		}).map(function(urlResult) {
			return getPlayerLinksSingleTeam(urlResult.value.html);
		}).reduce(function(a,b) {
			return a.concat(b);
		});
	}).catch(function(err) {
		console.err(err);
	});
};

function getPlayerLinksSingleTeam(html) {
	var $ = cheerio.load(html);
	return $('div.teamanalyse').first().find('td>a').map(function(idx, val) {
		return {name : $(this).text(), link : $(this).attr('href')};
	});
};

function getTeamLinks() {
	return requestUrl(url_ligainsider).then(function(requestedUrl) {
		var $ = cheerio.load(requestedUrl.html),
		playerLinks = $('div#teamlogos').first().find('div.team-logo>a').map(function(idx, teamUrl) {
			return $(this).attr('href') + "kaderanalyse/";
		});
		return getPlayerLinks(playerLinks);
	}).catch(function(err) {
		console.err(err);
	});
};

/*function getPlayerLinks(teamLinks, callback) {
	var promises = [];
	teamLinks.forEach(function(val, idx) {
		var deferred = Q.defer();
		request(url_ligainsider + val, function(error, response, html) {
			if (!error) {
				var $ = cheerio.load(html),
					playerLinkSet = {},
					playerLinks = [];
				$('div.teamanalyse').filter(function() {
					$(this).find('td>a').each(function(i, e) {
						playerLinkSet[$(e).text()] = $(e).attr('href');
					});
					for (var key in playerLinkSet) {
					  if (playerLinkSet.hasOwnProperty(key)) {
					  	playerLinks.push({name : key, link : playerLinkSet[key]});
					  }
					}
					deferred.resolve(playerLinks);
				});
			} else {
				deferred.reject(url_ligainsider + val + " message: "+ error.message);
			}
		});
		promises.push(deferred.promise);
	});
	Q.allSettled(promises).then(function(results) {
		callback(results.filter(function(val) {
			return val.state === 'fulfilled';
		}).map(function(val) {return val.value;}));
	});
};

	 
function getSinglePlayerNews(link, callback) {
	var url = url_ligainsider + link;
	request(url, function(error, response, html) {
		if (!error) {
			var news = [],
				$ = cheerio.load(html);
			$('div.detailpage-newsbrowser').filter(function() {
				
				var	date,
					newsText;
				$(this).find('div.detailpage-newsbox').each(function(i,e) {
					news.push({
						"date" : moment($(e).find('p.date-and-author').first().text().match(/(\d\d\.\d\d\.\d\d\d\d \d\d\:\d\d)/g)[0], "DD-MM-YYYY HH:mm").toDate(),
						"newsText" : $(e).find('p.news-text').first().text().replace(/[\t\n]/g,"")
					});
				});
			});
			callback(undefined, news);
		} else {
			callback(new Error('Could not load player site: ' + url));
		}
	});
	
};

function getTeamLinks(callback) {
	request(url_ligainsider, function(error, response, html) {
		if(!error) {
			var teamAnchors = [],
				$ = cheerio.load(html);
			$('div#teamlogos').filter(function() {
				$(this).find('a').each(function(i, e) {
					teamAnchors.push($(e).attr('href'));
				});
			});
			callback(undefined, teamAnchors);
		} else {
			callback(new Error('Could not load news site: ' + url_ligainsider));
		}
	});
};

exports.getPlayerNews = function(callback) {

	getTeamLinks(function(error, result) {
		if (error) {
			callback(error);
		} else {
			getPlayerLinks(result, function(result) {
				var promises = [];
				result.forEach(function(value, idx) {
					value.forEach(function(v, i) {
						var deferred = Q.defer();
						getSinglePlayerNews(v.link, function(err, val) {
							if(err) {
								deferred.reject(err);
							} else {
								deferred.resolve({name : v.name, news : val});
							}
						});
						promises.push(deferred.promise);
					});
				});
				Q.allSettled(promises).then(function(result) {
					callback(result.filter(function(val) {
						return val.state === 'fulfilled';
					}).map(function(val){return val.value;}));
				});
			});
		}
	});
};*/

exports.getPlayerNews = function(callback) {

	getTeamLinks().then(console.log);
};