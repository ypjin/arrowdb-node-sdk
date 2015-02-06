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
	geo_fence_id = null;

describe('Geo Fence Test', function() {
	this.timeout(50000);
	describe('login admin user', function() {
		it('Should login an admin user successfully', function(done) {
			arrowDBApp.usersLogin({
				login: 'admin',
				password: 'cocoafish'
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'loginUser');
				assert(result.body.response);
				assert(result.body.response.users);
				assert(result.body.response.users[0]);
				assert.equal(result.body.response.users[0].admin, 'true');
				done();
			});
		});
	});

	describe('positive geo fences tests', function() {
		it('Should create a geo fence successfully - create', function(done) {
			arrowDBApp.geoFencesCreate({
				geo_fence: {
					'loc':{'coordinates':[-122.4167,37.7833], 'radius':'10/3959'},
					'payload':{'alert':'24-hour sale at our SF flagship store on 12/26!'},
					'start_time': '2020-03-08T00:00',
					'end_time':'2020-12-26T19:00'
				}
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert(result.body.response);
				var obj = result.body.response.geo_fences[0];
				geo_fence_id = obj.id;
				done();
			});
		});

		it('Should update the geo fence successfully - update', function(done) {
			arrowDBApp.geoFencesUpdate({
				id: geo_fence_id,
				geo_fence: {
					'loc':{
						'coordinates':[-122.4167,37.7833],
						'radius':'2/6371'
					}
				}
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				var obj = result.body.response.geo_fences[0];
				assert.equal(obj.id, geo_fence_id);
				assert.equal(obj.loc.radius, '2/6371');
				done();
			});
		});

		it('Should get the count of geo fences successfully - count', function(done) {
			arrowDBApp.geoFencesCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);

				done();
			});
		});

		it('Should query geo fences successfully - query', function(done) {
			arrowDBApp.geoFencesQuery({}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert(result.body.response);
				assert(result.body.response.geo_fences);
				done();
			});
		});
	});

	describe('negative geo fences tests', function() {
		it('Should fail to create a geo fence without geo_fence - create', function(done) {
			arrowDBApp.geoFencesCreate({}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				done();
			});
		});

		it('Should fail to update the geo fence without id - update', function(done) {
			arrowDBApp.geoFencesUpdate({}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				done();
			});
		});

		it('Should fail to delete the geo fence without id - delete', function(done) {
			arrowDBApp.geoFencesDelete({}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				done();
			});
		});
	});

	describe('cleanup', function() {
		it('Should remove the geo fence successfully - remove', function(done) {
			arrowDBApp.geoFencesDelete({
				id: geo_fence_id
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				done();
			});
		});
	});

});
