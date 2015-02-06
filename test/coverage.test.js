var assert = require('assert'),
	testUtil = require('./testUtil'),
	ArrowDBError = require('../lib/arrowdbError'),
	messages = require('../lib/messages');

var arrowDBEntryPoint = (process.env.ARROWDB_ENTRYPOINT ? process.env.ARROWDB_ENTRYPOINT : 'https://api.cloud.appcelerator.com');
var arrowDBKey = process.env.ARROWDB_APPKEY;
if (!arrowDBKey) {
	console.error('Please create an ArrowDB app and assign ARROWDB_APPKEY in environment vars.');
	process.exit(1);
}
console.log('ArrowDB Entry Point: %s', arrowDBEntryPoint);
console.log('MD5 of ARROWDB_APPKEY: %s', testUtil.md5(arrowDBKey));

var ArrowDB = require('../index');

describe('Code Coverage Test', function() {
	describe('.arrowDBError', function() {
		it('Should throw a general ArrowDB error', function(done) {
			try {
				throw new ArrowDBError();
			} catch (e) {
				assert(e);
				assert.equal(e.errorCode, 0);
				assert.equal(e.docUrl, null);
				assert.equal(e.message, 'ArrowDB Node SDK Error');
			}
			done();
		});

		it('Should throw an ArrowDB error with error message', function(done) {
			try {
				throw new ArrowDBError(messages.ERR_MISS_REQUIRED_PARAMETER, {
					parameter: 'test missing field'
				});
			} catch (e) {
				assert.equal(e.errorCode, 1001);
				assert.equal(e.message, 'Required parameter test missing field is missing.');
			}
			done();
		});
	});

	describe('.arrowDBApp', function() {
		it('Should list ArrowDB objects correctly', function(done) {
			var arrowDBObjects = ArrowDB.getDBObjects();
			assert(arrowDBObjects);
			assert(arrowDBObjects.ACLs);
			assert(arrowDBObjects.Chats);
			assert(arrowDBObjects.Checkins);
			assert(arrowDBObjects.Clients);
			assert(arrowDBObjects.CustomObjects);
			assert(arrowDBObjects.Emails);
			assert(arrowDBObjects.Events);
			assert(arrowDBObjects.Files);
			assert(arrowDBObjects.Friends);
			assert(arrowDBObjects.KeyValues);
			assert(arrowDBObjects.Likes);
			assert(arrowDBObjects.Logs);
			assert(arrowDBObjects.Messages);
			assert(arrowDBObjects.PhotoCollections);
			assert(arrowDBObjects.Photos);
			assert(arrowDBObjects.Places);
			assert(arrowDBObjects.Posts);
			assert(arrowDBObjects.PushNotifications);
			assert(arrowDBObjects.PushSchedules);
			assert(arrowDBObjects.Reviews);
			assert(arrowDBObjects.SocialIntegrations);
			assert(arrowDBObjects.Statuses);
			assert(arrowDBObjects.Users);
			done();
		});

		it('Should not create ArrowDB instance if parameters are wrong', function(done) {
			var testArrowDBApp = null;
			try {
				testArrowDBApp = new ArrowDB();
			} catch (e) {
				assert(e);
				assert.equal(e.errorCode, 1001);
			}
			try {
				testArrowDBApp = new ArrowDB(true);
			} catch (e) {
				assert(e);
				assert.equal(e.errorCode, 1002);
			}
			try {
				testArrowDBApp = new ArrowDB('ArrowDBKey', 'wrong_parameter');
			} catch (e) {
				assert(e);
				assert.equal(e.errorCode, 1002);
			}
			done();
		});

		it('Should create ArrowDB with customized entry point successfully', function(done) {
			var arrowDBKey = 'ArrowDBKey';
			var testEntryPoint = 'https://api-test.cloud.appcelerator.com';
			var testArrowDBApp = new ArrowDB(arrowDBKey, {
				apiEntryPoint: testEntryPoint
			});
			assert(testArrowDBApp);
			assert.equal(testArrowDBApp.appKey, arrowDBKey);
			assert(testArrowDBApp.appOptions);
			assert.equal(testArrowDBApp.appOptions.apiEntryPoint, testEntryPoint);
			done();
		});

		it('Should create ArrowDB with default entry point successfully', function(done) {
			var arrowDBKey = 'ArrowDBKey';
			var defaultEntryPoint = 'https://api.cloud.appcelerator.com';
			var testArrowDBApp = new ArrowDB(arrowDBKey, {});
			assert(testArrowDBApp);
			assert.equal(testArrowDBApp.appKey, arrowDBKey);
			assert(testArrowDBApp.appOptions);
			assert.equal(testArrowDBApp.appOptions.apiEntryPoint, defaultEntryPoint);
			done();
		});
	});
});
