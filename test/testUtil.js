var ArrowDB = require('../index'),
	crypto = require('crypto'),
	testArrowDBApp = null;

var generateUsername = function(callback) {
	crypto.randomBytes(5, function(ex, buf) {
		var arrowDBUsername = 'arrowdb_user_' + buf.toString('hex');
		return callback ? callback(arrowDBUsername) : null;
	});
};
var md5 = function(originalString) {
	var md5sum = crypto.createHash('md5');
	md5sum.update(originalString);
	return md5sum.digest('hex');
};

function overwriteLine(chunk) {
	if (process.stdout._type === 'tty') {
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		var lastLine = chunk.toString().replace(/\n*$/, '').match(/[^\n]*$/)[0];
		process.stdout.write(lastLine.substring(0, process.stdout.getWindowSize()[0]));
	}
}

function countdown(func, text, timeout) {
	var remaining = Math.floor(timeout / 1000);
	overwriteLine(text + remaining);
	var counter = setInterval(function() {
		remaining--;
		if (remaining <= 0) {
			clearInterval(counter);
		}
		overwriteLine(remaining ? text + remaining : '');
	}, 1000);
	setTimeout(func, timeout);
}

function processWait(arrowDBInstance, type, id, cb, interval, maxTries, i) {
	if (!i) {
		i = 0;
	}
	if (!maxTries) {
		maxTries = 10;
	}
	if (!interval) {
		interval = 2000;
	}
	if (!id) {
		cb(new Error('id is undefined'));
	}

	var showMethod = type + 'sShow';
	if (type == 'photo') {
		arrowDBInstance[showMethod]({
			file_id: id,
			photo_id: id
		}, function(err, result) {
			i++;
			if (result && result.body && result.body.meta && result.body.response && result.body.meta.code == 200 && result.body.response[type + 's'][0].processed) {
				cb();
			} else if (i == maxTries) {
				cb(new Error('The ' + type + ' ' + id + ' was not processed'));
			} else {
				countdown(function() {
					processWait(arrowDBInstance, type, id, cb, interval, maxTries, i);
				}, 'Waiting for ' + type + ' to be processed. Attempted ' + i + '/' + maxTries + ' - ', interval);
			}
		});
	}
}

function getTestArrowDBApp() {
	if (!testArrowDBApp) {
		var arrowDBKey = process.env.ARROWDB_APPKEY;
		var arrowDBEntryPoint = (process.env.ARROWDB_ENTRYPOINT ? process.env.ARROWDB_ENTRYPOINT : 'https://api.cloud.appcelerator.com');
		if (!arrowDBKey) {
			console.error('Please create an ArrowDB app and assign ARROWDB_APPKEY in environment vars.');
			process.exit(1);
		}
		console.log('ArrowDB Entry Point: %s', arrowDBEntryPoint);
		console.log('MD5 of ARROWDB_APPKEY: %s', md5(arrowDBKey));

		testArrowDBApp = new ArrowDB(arrowDBKey, {
			apiEntryPoint: arrowDBEntryPoint,
			prettyJson: true
		});
	}
	return testArrowDBApp;
}

module.exports.generateUsername = generateUsername;
module.exports.md5 = md5;
module.exports.processWait = processWait;
module.exports.getTestArrowDBApp = getTestArrowDBApp;
