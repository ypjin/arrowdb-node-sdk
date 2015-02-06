var assert = require('assert'),
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
	custom_object_id = null,
	like_id = null;


describe('Likes Test', function() {
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
				var obj = result.body.response.events[0];
				event_id = obj.id;
				done();
			});
		});

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
				done();
			});
		});

		it('Should create a custom object successfully - create', function(done) {
			var classname = 'Car';
			arrowDBApp.customObjectsCreate({
				classname: classname,
				fields: '{"city":"beijing"}'
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'createObject');
				var obj = result.body.response[classname][0];
				assert.equal(obj.city, 'beijing');
				custom_object_id = obj.id;
				done();
			});
		});
	});

	describe('positive likes tests', function() {
		it('Should create a like(event) successfully', function(done) {
			arrowDBApp.likesCreate({
				event_id: event_id
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				var obj = result.body.response.likes[0];
				like_id = obj.id;
				assert.equal(obj.likeable_type, 'Event');
				assert.equal(obj.likeable_id, event_id);
				done();
			});
		});

		it('Should create a like(checkin) successfully', function(done) {
			arrowDBApp.likesCreate({
				checkin_id: checkin_id
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				var obj = result.body.response.likes[0];
				like_id = obj.id;
				assert.equal(obj.likeable_type, 'Checkin');
				assert.equal(obj.likeable_id, checkin_id);
				done();
			});
		});

		it('Should query likes successfully', function(done) {
			arrowDBApp.likesQuery({}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				done();
			});
		});

		it('Should create a like(custom object) successfully', function(done) {
			arrowDBApp.likesCreate({
				custom_object_id: custom_object_id
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				var obj = result.body.response.likes[0];
				assert.equal(obj.likeable_type, 'CustomObject');
				assert.equal(obj.likeable_id, custom_object_id);
				done();
			});
		});

		it('Should delete a like(event) successfully', function(done) {
			arrowDBApp.likesDelete({
				event_id: event_id
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'deleteLike');
				done();
			});
		});

		it('Should delete a like(checkin) successfully', function(done) {
			arrowDBApp.likesDelete({
				checkin_id: checkin_id
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'deleteLike');
				done();
			});
		});

		it('Should delete a like(custom object) successfully', function(done) {
			arrowDBApp.likesDelete({
				custom_object_id: custom_object_id
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'deleteLike');
				done();
			});
		});

		it('Should fail to delete an unlike(custom object) successfully', function(done) {
			arrowDBApp.likesDelete({
				custom_object_id: custom_object_id
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Invalid CustomObject id or current user hasn\'t liked it');
				done();
			});
		});
	});

	describe('negative likes tests', function() {
		it('Should fail to create a like successfully', function(done) {
			arrowDBApp.likesCreate({}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Invalid like type');
				done();
			});
		});

		it('Should fail to delete a no-existing like(custom object) successfully', function(done) {
			arrowDBApp.likesDelete({
				custom_object_id: '545980ebdda095222c000004'
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'custom_object not found');
				done();
			});
		});
	});

	describe('cleanup', function() {
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
