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
	name = 'SN_' + new Date().getTime().toString(),
	value = '098765432';


describe('Keyvalues Test', function() {
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
				}, function(err, result) {
					assert.ifError(err);
					assert(result);
					done();
				});
			});
		});
	});

	describe('positive keyvalues tests', function() {
		it('Should create a keyvalue successfully', function(done) {
			arrowDBApp.keyValuesSet({
				name: name,
				value: value
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'setKeyvalue');
				done();
			});
		});

		it('Should append a keyvalue successfully', function(done) {
			var appended_value = '1234567890';
			arrowDBApp.keyValuesAppend({
				name: name,
				value: appended_value
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'appendKeyvalue');
				var obj = result.body.response.keyvalues[0];
				assert.equal(obj.name, name);
				assert.equal(obj.value, value + appended_value);
				done();
			});
		});

		it('Should get a keyvalue successfully', function(done) {
			arrowDBApp.keyValuesGet({
				name: name
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'getKeyvalue');
				var obj = result.body.response.keyvalues[0];
				assert.equal(obj.name, name);
				done();
			});
		});

		it('Should delete a keyvalue successfully', function(done) {
			arrowDBApp.keyValuesDelete({
				name: name
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'deleteKeyvalue');
				done();
			});
		});

		it('Should get a keyvalue successfully', function(done) {
			arrowDBApp.keyValuesGet({
				name: name
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				done();
			});
		});

		it('Should create a keyvalue with value is integer successfully', function(done) {
			arrowDBApp.keyValuesSet({
				name: name,
				value: 5
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'setKeyvalue');
				done();
			});
		});

		it('Should increase a keyvalue with a positive integer successfully', function(done) {
			arrowDBApp.keyValuesIncrby({
				name: name,
				value: 2
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'incrbyKeyvalue');
				var obj = result.body.response.keyvalues[0];
				assert.equal(obj.name, name);
				assert.equal(obj.value, 7);
				done();
			});
		});

		it('Should increase a keyvalue with a negative integer successfully', function(done) {
			arrowDBApp.keyValuesIncrby({
				name: name,
				value: -5
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'incrbyKeyvalue');
				var obj = result.body.response.keyvalues[0];
				assert.equal(obj.name, name);
				assert.equal(obj.value, 2);
				done();
			});
		});

		it('Should count keyvalues successfully', function(done) {
			arrowDBApp.keyValuesCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'keyvaluesCount');
				done();
			});
		});

		it('Should delete a keyvalue successfully', function(done) {
			arrowDBApp.keyValuesDelete({
				name: name
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'deleteKeyvalue');
				done();
			});
		});
	});

	describe('negative keyvalues tests', function() {
		it('Should fail to create a keyvalue without value', function(done) {
			arrowDBApp.keyValuesSet({
				name: name
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Key-value value required');
				done();
			});
		});

		it('Should fail to create a keyvalue without name', function(done) {
			arrowDBApp.keyValuesSet({
				value: value
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Key-value name required');
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
