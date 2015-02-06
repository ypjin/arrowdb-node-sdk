var assert = require('assert'),
	testUtil = require('./testUtil'),
	fs = require('fs');

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
	arrowDBPlaceCount = 0,
	arrowDBPlaceId = null,
	arrowDBUserId = null,
	arrowDBPhotoId = null;

var timeout = 200000;

var placeObj = {
	name: 'place_test',
	address: '58 South Park Ave.',
	city: 'San Francisco',
	state: 'California',
	postal_code: '94107-1807',
	country: 'United States',
	latitude: 37.782227,
	longitude: -122.393159,
	website: 'http://cocoafish.com',
	twitter: 'arrowdb',
	phone_number: '1234567',
	custom_fields: {
		a: 1
	}
};

describe('Places Test', function() {
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
			arrowDBUserId = result.body.response.users[0].id;
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

	before(function(done) {
		arrowDBApp.placesCount(function(err, result) {
			assert.ifError(err);
			assert(result.body);
			assert(result.body.meta);
			assert.equal(result.body.meta.code, 200);
			done();
		});
	});
	describe('Create, update, count and show place', function() {
		it('Should create a place', function(done) {
			var photo_file = fs.createReadStream(__dirname + '/files/appcelerator.png');
			placeObj.photo = photo_file;
			placeObj.response_json_depth = 3;
			arrowDBApp.placesCreate(placeObj, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'createPlace');
				assert(result.body.response);
				assert(result.body.response.places);
				arrowDBPlaceCount = arrowDBPlaceCount + 1;
				arrowDBPlaceId = result.body.response.places[0].id;
				assert(result.body.response.places[0].photo);
				assert(result.body.response.places[0].photo.id);
				arrowDBPhotoId = result.body.response.places[0].photo.id;
				testUtil.processWait(arrowDBApp, 'photo', arrowDBPhotoId, done, 5000);
			});
		});

		it('Should return the place count', function(done) {
			arrowDBApp.placesCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				done();
			});
		});

		it('Should update the place', function(done) {
			arrowDBApp.placesUpdate({
				place_id: arrowDBPlaceId,
				name: 'place_test_change'
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'updatePlace');
				assert(result.body.response);
				assert(result.body.response.places);
				assert(result.body.response.places[0].name);
				assert.equal(result.body.response.places[0].name, 'place_test_change');
				done();
			});
		});
		it('Should show the place', function(done) {
			arrowDBApp.placesShow({
				place_id: arrowDBPlaceId
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'showPlace');
				assert(result.body.response);
				assert(result.body.response.places);
				assert(result.body.response.places[0].name);
				assert.equal(result.body.response.places[0].name, 'place_test_change');
				done();
			});
		});
	});
	describe('quary and search places', function() {
		it('Quary should return all places', function(done) {
			arrowDBApp.placesQuery({
				limit: 100,
				where: {
					user_id: arrowDBUserId
				}
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'queryPlaces');
				assert(result.body.response);
				assert(result.body.response.places);
				assert.equal(1, result.body.response.places.length);
				done();
			});
		});
		it('Search should return all places', function(done) {
			arrowDBApp.placesSearch({
				user_id: arrowDBUserId
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'searchPlaces');
				assert(result.body.response);
				assert(result.body.response.places);
				done();
			});
		});
	});
	describe('remove place', function() {
		it('Should delete place', function(done) {
			arrowDBApp.placesRemove({
				place_id: arrowDBPlaceId
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				arrowDBPlaceCount = arrowDBPlaceCount - 1;
				done();
			});
		});
		it('Should return none place', function(done) {
			arrowDBApp.placesCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				done();
			});
		});
	});

	describe('Negative test', function() {
		it('create without passing name field', function(done) {
			arrowDBApp.placesCreate({}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Failed to create place: Validation failed - Place must have one the of [longitude, latitude] or address or city or state or country or postal_code, Name can\'t be blank.');
				done();
			});
		});

		it('show using invalid place id', function(done) {
			arrowDBApp.placesShow({
				place_id: 'invalid'
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Invalid place id');
				done();
			});
		});

		it('update using invalid place id', function(done) {
			arrowDBApp.placesUpdate({
				place_id: 'invalid'
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Invalid place id');
				done();
			});
		});

		it('delete using invalid place id', function(done) {
			arrowDBApp.placesRemove({
				place_id: 'invalid'
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Invalid place id');
				done();
			});
		});
	});
});
