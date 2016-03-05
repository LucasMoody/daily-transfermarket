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
	var promises = teamLinks.map(function(idx, link) {
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
	var links = {};
	$('tbody div.pic a').each(function(idx, link) {
		links[$(this).attr('href')] = true;
	});
	return Object.keys(links);
};

function getTeamLinks() {
	return requestUrl(url_ligainsider).then(function(requestedUrl) {
		var $ = cheerio.load(requestedUrl.html);
		return $('div#teamlogos').first().find('div.team-logo>a').map(function(idx, teamUrl) {
			return $(this).attr('href') + "kader/";
		});
	});
};

function getSinglePlayerNews(html) {
	var $ = cheerio.load(html),
		name,
		news = [];
	name = $('div#detailpage-headline h1').text();
	$('div.detailpage-newsbrowser div.detailpage-newsbox').each(function(idx, val) {
		var dateAndAuthor, headline, newsText, link, linkSource, date;
		dateAndAuthor = $(this).find('p.date-and-author').text();
		headline = $(this).find('h3 a').text().replace(/\s+/g, " ");
		newsText = $(this).find('p.news-text').text().replace(/\s+/g, " ").replace(/mehr $/, "");
		link = $(this).find('p.news-source span.online').attr('onclick');
		if (link == undefined) {
			link = 'offline';
		} else {
			link = link.replace("linkToExternalPage('redirect.php?url=", "")
				.replace(/&title=.*'\);/, ""); //link
		}
		linkSource = $(this).find('p.news-source span.online').text(); //source
		link = decodeURIComponent(link);
		date = dateAndAuthor.match(/\d\d\.\d\d\.\d\d\d\d \d\d:\d\d/)[0];
		news.push({
			categories: [name],
			pubDate: moment(date, "DD.MM.YYYY HH:mm").toDate(),
			title: headline,
			description: newsText,
			link: link,
			linksource: linkSource ? linkSource : ""
		});
	});
	return news;
}

getTeamLinks().then(function(playerLinks) {
	return getPlayerLinks(playerLinks);
}).then(function(playerLinks) {
	return Q.allSettled(playerLinks.map(function(link) {
		return requestUrl(url_ligainsider + link);
	}));
}).then(function(playerSites) {
	var playernews = playerSites.filter(function(site) {
		return site.state === "fulfilled";
	}).map(function(site) {
		return getSinglePlayerNews(site.value.html);
	}).reduce(function(a,b) {
		return a.concat(b);
	});
	// input: [{ title: title, description: description, link: link, categories: categories, pubDate: pubDate, date: date }, ...]
	seneca.client(10102).act({role:"database",news:"add",data:playernews});
}).catch(function(err) {
	console.error(err);
});
