var request = require('request'),
	cheerio = require('cheerio'),
	Q = require('q');

function requestUrl(url) {
	var deferred = Q.defer();
	request(url, function(error, response, html) {
		if (error) deferred.reject("url: " + url + ", message: " + error.message);
		else deferred.resolve({response : response, html : html});
	});
	return deferred.promise;
};

function scrapePlayerRatingsOfMatch(url) {
	requestUrl(url).then(function(result) {
		var response = result.response,
			html = result.html;
		var $ = cheerio.load(html);
		$(.stat_einzelkritik_row).forEach(function(playerRating) {

		});
	})
}

.stat_einzelkritik_row = jede Kritik

.stat_einzelkritik_box_head_14 => note

.einzelkritik > a => Name

.stat_einzelkritik_box_head + div => Bewertungstext