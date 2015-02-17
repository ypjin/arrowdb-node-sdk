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
	arrowDBAppManualSession = new ArrowDB(arrowDBKey, {
		apiEntryPoint: arrowDBEntryPoint,
		prettyJson: true,
		autoSessionManagement: false
	}),
	arrowDBUsername = null,
	arrowDBUsernameManualSession = null,
	manualSessionCookieString = null,
	arrowDBPassword = 'cocoafish';

describe('Users Test', function() {
	before(function(done) {
		testUtil.generateUsername(function(username) {
			arrowDBUsername = username;
			console.log('\tGenerated arrowdb user: %s', arrowDBUsername);

			testUtil.generateUsername(function(username) {
				arrowDBUsernameManualSession = username;
				console.log('\tGenerated arrowdb user for manual session tests: %s', arrowDBUsernameManualSession);
				done();
			});
		});
	});

	describe('.queryAndCountUsers', function() {
		it('Should return all users', function(done) {
			this.timeout(20000);
			arrowDBApp.usersQuery({
				limit: 100
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'queryUsers');
				assert(result.body.response);
				assert(result.body.response.users);
				assert(result.body.response.users.length >= 0);
				assert(result.body.response.users.length <= 100);
				done();
			});
		});

		it('Should count user corrently', function(done) {
			this.timeout(20000);
			arrowDBApp.usersCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				// A bug of https://jira.appcelerator.org/browse/CLOUDSRV-4022
				// assert.equal(result.body.meta.method_name, 'countUser');
				assert.equal(result.body.meta.method_name, 'usersCount');
				assert(result.body.meta.count || (result.body.meta.count === 0));
				done();
			});
		});
	});

	describe('.createUser', function() {
		it('Should create user successfully', function(done) {
			this.timeout(20000);
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
				done();
			});
		});

		it('Should query user correctly', function(done) {
			this.timeout(20000);
			arrowDBApp.usersQuery({
				where: {
					username: arrowDBUsername
				}
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'queryUsers');
				assert(result.body.response);
				assert(result.body.response.users);
				assert(result.body.response.users[0]);
				assert.equal(result.body.response.users[0].username, arrowDBUsername);
				done();
			});
		});
	});

	describe('.loginUser', function() {
		it('Newly created user should be able to login successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.usersLogin({
				login: arrowDBUsername,
				password: arrowDBPassword
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'loginUser');
				assert(result.body.response);
				assert(result.body.response.users);
				assert(result.body.response.users[0]);
				assert.equal(result.body.response.users[0].username, arrowDBUsername);
				done();
			});
		});

		it('Should show logged in user correctly with stored cookie string', function(done) {
			this.timeout(20000);
			arrowDBApp.usersShowMe(function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'showMe');
				assert(result.body.response);
				assert(result.body.response.users);
				assert(result.body.response.users[0]);
				assert.equal(result.body.response.users[0].username, arrowDBUsername);
				done();
			});
		});
	});

	describe('.updateUser', function() {
		it('Should update user successfully with custom_fields as a hash', function(done) {
			this.timeout(20000);
			arrowDBApp.usersUpdate({
				custom_fields: {
					test: true
				}
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'updateUser');
				assert(result.body.response);
				assert(result.body.response.users);
				assert(result.body.response.users[0]);
				assert(result.body.response.users[0].custom_fields);
				assert(result.body.response.users[0].custom_fields.test);
				assert.equal(result.body.response.users[0].custom_fields.test, true);
				done();
			});
		});

		it('Should update user successfully with custom_fields as a string via rest call', function(done) {
			this.timeout(20000);
			arrowDBApp.put('/v1/users/update.json', {
				custom_fields: '{"test":true}'
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'updateUser');
				assert(result.body.response);
				assert(result.body.response.users);
				assert(result.body.response.users[0]);
				assert(result.body.response.users[0].custom_fields.test);
				assert.equal(result.body.response.users[0].custom_fields.test, true);
				done();
			});
		});
	});

	describe('.deleteUser', function() {
		it('Should delete current user successfully', function(done) {
			this.timeout(20000);
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

	describe('Manual Session Manamement', function() {
		it('Should create user successfully', function(done) {
			this.timeout(20000);
			arrowDBAppManualSession.usersCreate({
				username: arrowDBUsernameManualSession,
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
				assert.equal(result.body.response.users[0].username, arrowDBUsernameManualSession);
				done();
			});
		});

		it('Newly created user should be able to login successfully', function(done) {
			this.timeout(20000);
			arrowDBAppManualSession.usersLogin({
				login: arrowDBUsernameManualSession,
				password: arrowDBPassword
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'loginUser');
				assert(result.body.response);
				assert(result.body.response.users);
				assert(result.body.response.users[0]);
				assert.equal(result.body.response.users[0].username, arrowDBUsernameManualSession);
				arrowDBAppManualSession.sessionCookieString = result.cookieString;
				manualSessionCookieString = result.cookieString;
				done();
			});
		});

		it('Should create a keyvalue successfully', function(done) {
			this.timeout(20000);
			arrowDBAppManualSession.keyValuesSet({
				name: 'foo',
				value: 'bar'
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'setKeyvalue');
				done();
			});
		});

		it('Should delete a keyvalue successfully', function(done) {
			this.timeout(20000);
			arrowDBAppManualSession.keyValuesDelete({
				name: 'foo'
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'deleteKeyvalue');
				done();
			});
		});

		it('Should nullify session', function(done) {
			this.timeout(20000);
			arrowDBAppManualSession.sessionCookieString = null;
			done();
		});

		it('Should fail to create a keyvalue', function(done) {
			this.timeout(20000);
			arrowDBAppManualSession.keyValuesSet({
				name: 'foo',
				value: 'bar'
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				done();
			});
		});

		it('Should delete current user successfully', function(done) {
			this.timeout(20000);
			arrowDBAppManualSession.sessionCookieString = manualSessionCookieString;
			arrowDBAppManualSession.usersRemove(function(err, result) {
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
