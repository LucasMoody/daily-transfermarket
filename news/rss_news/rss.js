var request = require('request'),
	Iconv = require('iconv').Iconv;

function fetchRss(url, feedparser) {
	var req = request(url, {timeout: 10000, pool: false});
	req.setMaxListeners(50);
	req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
	req.setHeader('accept', 'text/html,application/xhtml+xml');

	// Define our handlers

	//TODO request error handler
	req.on('error', function(err) {
		feedparser.emit('error', err);
	});

	req.on('response', function(res) {
		if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
		var charset = getParams(res.headers['content-type'] || '').charset;
    	res = maybeTranslate(res, charset);
		// And boom goes the dynamite
		res.pipe(feedparser);
	});
}

function maybeTranslate (res, charset) {
  var iconv;
  // Use iconv if its not utf8 already.
  if (!iconv && charset && !/utf-*8/i.test(charset)) {
    try {
      iconv = new Iconv(charset, 'utf-8');
      iconv.on('error', function(err) {
      	res.emit('error', err);	
      });
      // If we're using iconv, stream will be the output of iconv
      // otherwise it will remain the output of request
      res = res.pipe(iconv);
    } catch(err) {
      res.emit('error', err);
    }
  }
  return res;
}

function getParams(str) {
  var params = str.split(';').reduce(function (params, param) {
    var parts = param.split('=').map(function (part) { return part.trim(); });
    if (parts.length === 2) {
      params[parts[0]] = parts[1];
    }
    return params;
  }, {});
  return params;
}

exports.fetchRss = fetchRss;