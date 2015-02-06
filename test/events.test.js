var assert = require('assert'),
	fs = require('fs'),
	testUtil = require('./testUtil');

var arrowDBEntryPoint = (process.env.ARROWDB_ENTRYPOINT ? process.env.ARROWDB_ENTRYPOINT : 'https://api.cloud.appcelerator.com');
var arrowDBKey = process.env.ARROWDB_APPKEY;
if (!arrowDBKey) {
	console.error('Please create an ArrowDB app and assign ARROWDB_APPKEY in environment vars.');
	process.exit(1);
}
console.log('ArrowDB Entry Point: %s', arrowDBEntryPoint);
console.log('MD5 of ARROWDB_APPKEY: %s', testUtil.md5(arrowDBKey));

var ArrowDB = require('../index'),
	arrowDBApp = new ArrowDB(arrowDBKey, {
		apiEntryPoint: arrowDBEntryPoint,
		prettyJson: true,
		responseJsonDepth: 1
	}),
	arrowDBUsername = null,
	arrowDBPassword = 'cocoafish',
	event_id = null,
	photo_id = null;

describe('Events Test', function() {
	this.timeout(50000);
	before(function(done) {
		testUtil.generateUsername(function(username) {
			arrowDBUsername = username;
			console.log('\tGenerated arrowdb user: %s', arrowDBUsername);
			done();
		});
	});

	describe('create user', function() {
		it('Should create user successfully', function(done) {
			arrowDBApp.usersCreate({
				username: arrowDBUsername,
				password: arrowDBPassword,
				password_confirmation: arrowDBPassword
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'createUser');
				var obj = result.body.response.users[0];
				assert.equal(obj.username, arrowDBUsername);

				arrowDBApp.usersLogin({
					login: arrowDBUsername,
					password: arrowDBPassword
				}, function (err, result) {
					assert.ifError(err);
					assert(result);
					done();
				});
			});
		});
	});

	describe('positive event tests', function() {
		it('Should create an event(start_time: new Date()) successfully - create', function(done) {
			arrowDBApp.eventsCreate({
				name: 'Test - events',
				photo: fs.createReadStream(__dirname + '/files/appcelerator.png'),
				start_time: new Date(),
				duration: 3
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert(result.body.response);
				var obj = result.body.response.events[0];
				event_id = obj.id;
				photo_id = obj.photo_id;
				testUtil.processWait(arrowDBApp, 'photo', photo_id, done, 5000);
			});
		});

		it('Should create an event(start_time: "2014-011-05T20:59:50+0000") successfully', function(done) {
			arrowDBApp.eventsCreate({
				name: 'Test - events2',
				photo_id: photo_id,
				start_time: '2014-011-05T20:59:50+0000',
				duration: 9
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				var obj = result.body.response.events[0];
				event_id = obj.id;
				assert.equal(obj.photo_id, photo_id);
				assert.equal(obj.name, 'Test - events2');
				done();
			});
		});

		it('Should create an event(start_time: new Date()) successfully - create', function(done) {
			arrowDBApp.eventsCreate({
				name: 'Test - events()',
				photo: fs.createReadStream(__dirname + '/files/appcelerator.png'),
				start_time: new Date(),
				duration: 3
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				testUtil.processWait(arrowDBApp, 'photo', photo_id, done, 5000);
			});
		});

		it('Should update an event successfully', function(done) {
			var event_name = 'Test - new events';
			arrowDBApp.eventsUpdate({
				event_id: event_id,
				name: event_name,
				start_time: new Date(),
				duration: 6
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				var obj = result.body.response.events[0];
				event_id = obj.id;
				assert.equal(obj.id, event_id);
				assert.equal(obj.name, event_name);
				assert.equal(obj.duration, 6);
				assert.equal(obj.id, event_id);
				done();
			});
		});

		it('Should show an event successfully', function(done) {
			arrowDBApp.eventsShow({
				event_id: event_id
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert(result.body.response);
				assert(result.body.response.events);
				assert.equal(result.body.meta.method_name, 'showEvents');
				done();
			});
		});

		it('Should show an event occurrences successfully', function(done) {
			arrowDBApp.eventsShowOccurrences({
				event_id: event_id
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert(result.body.response);
				assert(result.body.response.event_occurrences);
				assert.equal(result.body.meta.method_name, 'showEventOccurrences');
				done();
			});
		});

		it('Should query events successfully', function(done) {
			arrowDBApp.eventsQuery({}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert(result.body.response);
				assert(result.body.response.events);
				done();
			});
		});

		it('Should query event occurrences successfully', function(done) {
			arrowDBApp.eventsQueryOccurrences({}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'queryEventOccurrences');
				done();
			});
		});

		it('Should search events successfully', function(done) {
			arrowDBApp.eventsSearch({}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert(result.body.response);
				assert(result.body.response.events);
				done();
			});
		});

		it('Should search event occurrences successfully', function(done) {
			arrowDBApp.eventsSearchOccurrences({}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'searchEventOccurrences');
				done();
			});
		});

		it('Should count event successfully', function(done) {
			arrowDBApp.eventsCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);

				done();
			});
		});

	});

	describe('negative event tests', function() {
		it('Should fail to create an event without start_time - create', function(done) {
			arrowDBApp.eventsCreate({
				name: 'Test - events'
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				done();
			});
		});

		it('Should fail to create an event without name - create', function(done) {
			arrowDBApp.eventsCreate({
				start_time: new Date()
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Failed to create event: Validation failed - Name can\'t be blank.');
				done();
			});
		});

		it('Should fail to create an event with invalid start_time', function(done) {
			arrowDBApp.eventsCreate({
				name: 'Test - events',
				start_time: '2011'
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Invalid calender schedule  invalid date');
				done();
			});
		});

		it('Should fail to update an event without event_id', function(done) {
			var event_name = 'Test - new events';
			arrowDBApp.eventsUpdate({
				name: event_name,
				start_time: new Date(),
				duration: 6
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Invalid event id');
				done();
			});
		});

		it('Should fail to update an event with invalid start_time - update', function(done) {
			arrowDBApp.eventsUpdate({
				event_id: event_id,
				start_time: '2011',
				duration: 8
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Invalid calender schedule  invalid date');
				done();
			});
		});

		it('Should fail to update an event with invalid duration - update', function(done) {
			arrowDBApp.eventsUpdate({
				event_id: event_id,
				start_time: '2011',
				duration: '8'
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Invalid calender schedule  invalid date');
				done();
			});
		});
	});

	describe('cleanup', function() {
		it('Should delete an event successfully', function(done) {
			arrowDBApp.eventsDelete({
				event_id: event_id
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'deleteEvent');
				done();
			});
		});

		it('Should delete a batch of events successfully', function(done) {
			arrowDBApp.eventsBatchDelete({}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 403);
				assert.equal(err.body.meta.message, 'You are not authorized to perform this action.');
				done();
			});
		});
		it('Should delete current user successfully', function(done) {
			arrowDBApp.usersRemove(function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'deleteUser');
				done();
			});
		});
	});

});
