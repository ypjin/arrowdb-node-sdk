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
	arrowDBPassword = 'cocoafish';

var timeout = 50000;

describe.skip('Clients Test', function() {
	this.timeout(timeout);

	before(function(done) {
		testUtil.generateUsername(function(username) {
			arrowDBUsername = username;
			console.log('\tGenerated arrowdb user: %s', arrowDBUsername);
			done();
		});
	});

	before(function(done) {
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

	before(function(done) {
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

	describe('Test clients geolocate', function() {
		it('Should return clients geolocate info', function(done) {
			arrowDBApp.clientsGeolocate({
				ip_address: '106.39.153.78'
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'geolocateClient');
				assert(result.body.response);
				assert(result.body.response.ip_address);
				var geolocate_info = result.body.response;
				assert.equal(geolocate_info.ip_address, '106.39.153.78');
				assert(result.body.response.location);
				assert(result.body.response.location.country_code);
				assert(result.body.response.location.city);
				assert(result.body.response.location.state);
				assert(result.body.response.location.postal_code);
				assert(result.body.response.location.latitude);
				assert(result.body.response.location.longitude);
				done();
			});
		});
	});
});
