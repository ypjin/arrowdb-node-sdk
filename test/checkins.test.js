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
		prettyJson: true
	}),
	arrowDBUsername = null,
	arrowDBPassword = 'cocoafish',
	event_id = null,
	checkin_id = null,
	checkin_id2 = null,
	message = 'Test - checkins(event) - ' + new Date().getTime(),
	newMessage = 'Test - new checkins(event) - ' + new Date().getTime();

describe('Checkins Test', function() {
	this.timeout(50000);
	before(function(done) {
		testUtil.generateUsername(function(username) {
			arrowDBUsername = username;
			console.log('\tGenerated arrowdb user: %s', arrowDBUsername);
			done();
		});
	});

	describe('create user and event', function() {
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
				assert(result.body.response);
				assert(result.body.response.users);
				assert(result.body.response.users[0]);
				assert.equal(result.body.response.users[0].username, arrowDBUsername);

				arrowDBApp.usersLogin({
					login: arrowDBUsername,
					password: arrowDBPassword
				}, function(err, result) {
					assert.ifError(err);
					assert(result);
					done();
				});
			});
		});

		it('Should create an event successfully', function(done) {
			arrowDBApp.eventsCreate({
				name: 'Test - checkins(event)',
				start_time: new Date(),
				duration: 8
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert(result.body.response);
				assert(result.body.response.events);
				event_id = result.body.response.events[0].id;
				done();
			});
		});
	});

	describe('positive checkin tests', function() {
		it('Should create a checkin successfully - create', function(done) {
			arrowDBApp.checkinsCreate({
				name: 'Test - checkins',
				event_id: event_id
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				var obj = result.body.response.checkins[0];
				checkin_id = obj.id;
				assert.equal(result.body.meta.method_name, 'createCheckin');
				done();
			});
		});

		it('Should show a checkin successfully - show', function(done) {
			arrowDBApp.checkinsShow({
				checkin_id: checkin_id
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert(result.body.response);
				assert(result.body.response.checkins);
				assert.equal(result.body.meta.method_name, 'showCheckins');
				done();
			});
		});

		it('Should update a checkin successfully - update', function(done) {
			arrowDBApp.checkinsUpdate({
				checkin_id: checkin_id,
				message: newMessage
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'updateCheckin');
				var obj = result.body.response.checkins[0];
				assert.equal(obj.message, newMessage);
				done();
			});
		});

		it('Should query checkins successfully - query', function(done) {
			arrowDBApp.checkinsQuery({}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'queryCheckins');
				var obj = result.body.response.checkins[0];
				assert.equal(obj.message, newMessage);
				done();
			});
		});

		it('Should query 0 checkin successfully - query', function(done) {
			arrowDBApp.checkinsQuery({
				where: {
					message: message
				}
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'queryCheckins');
				var obj = result.body.response.checkins;
				assert.equal(obj.length, 0);
				done();
			});
		});

		it('Should query 1 checkin successfully - query', function(done) {
			arrowDBApp.checkinsQuery({
				where: {
					message: newMessage
				}
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				var obj = result.body.response.checkins;
				assert.equal(obj.length, 1);
				done();
			});
		});

		it('Should count checkins successfully - count', function(done) {
			arrowDBApp.checkinsCount({

			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'checkinsCount');
				done();
			});
		});

		it('Should create a checkin with a photo successfully - create', function(done) {
			arrowDBApp.checkinsCreate({
				event_id: event_id,
				response_json_depth: 3,
				photo: fs.createReadStream(__dirname + '/files/appcelerator.png')
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'createCheckin');
				var obj = result.body.response.checkins[0];
				checkin_id2 = obj.id;
				testUtil.processWait(arrowDBApp, 'photo', obj.photo.id, done, 5000);
			});
		});

		it('Should show a checkin which has photo successfully - show', function(done) {
			arrowDBApp.checkinsShow({
				checkin_id: checkin_id2,
				response_json_depth: 3
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert(result.body.response);
				assert.equal(result.body.meta.method_name, 'showCheckins');
				var obj = result.body.response.checkins[0];
				assert.equal(obj.photo.processed, true);
				done();
			});
		});

		it('Should create a checkin without name successfully - create', function(done) {
			arrowDBApp.checkinsCreate({
				event_id: event_id
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'createCheckin');
				done();
			});
		});

		it('Should count checkins successfully', function(done) {
			arrowDBApp.checkinsCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				done();
			});
		});
	});

	describe('negative checkin tests', function() {
		it('Should fail to create a checkin without both place_id and event_id - create', function(done) {
			arrowDBApp.checkinsCreate({
				name: 'Test - checkins'
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				done();
			});
		});

		it('Should fail to create a checkin with an invalid event_id - create', function(done) {
			arrowDBApp.checkinsCreate({
				name: 'Test - checkins',
				event_id: '5459d218dda09549a3000083'
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				done();
			});
		});

		it('Should fail to create a checkin with an invalid place_id - create', function(done) {
			arrowDBApp.checkinsCreate({
				name: 'Test - checkins',
				place_id: '5459d218dda09549a3000083'
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				done();
			});
		});

		it('Should fail to delete a checkin without checkin_id - delete', function(done) {
			arrowDBApp.checkinsDelete({}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				done();
			});
		});

		it('Should fail to show a checkin without checkin_id - show', function(done) {
			arrowDBApp.checkinsShow({}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				done();
			});
		});

		it('Should fail to update a checkin without checkin_id - update', function(done) {
			arrowDBApp.checkinsUpdate({}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				done();
			});
		});
	});

	describe('cleanup', function() {
		it('Should delete a checkin successfully - delete', function(done) {
			arrowDBApp.checkinsDelete({
				checkin_id: checkin_id
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'deleteCheckin');
				done();
			});
		});

		it('Should fail to delete a batch of checkins - batch_delete', function(done) {
			arrowDBApp.checkinsBatchDelete({
				where: {
					message: newMessage
				}
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 403);
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
