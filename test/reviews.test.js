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
	arrowDBReviewCount = 0,
	arrowDBPlaceId = null,
	arrowDBPhotoId = null,
	arrowDBUserId = null,
	arrowDBReviewIds = [];

var timeout = 50000;

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

describe('Reviews Test', function() {
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
		arrowDBApp.reviewsCount(function(err, result) {
			assert.ifError(err);
			assert(result.body);
			assert(result.body.meta);
			assert.equal(result.body.meta.code, 200);
			done();
		});
	});
	describe('Create, update, count and show review', function() {
		it('Should create a place and a photo', function(done) {
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
				arrowDBPlaceId = result.body.response.places[0].id;
				arrowDBPhotoId = result.body.response.places[0].photo.id;
				testUtil.processWait(arrowDBApp, 'photo', arrowDBPhotoId, done, 5000);
			});
		});
		it('Should review the place', function(done) {
			arrowDBApp.reviewsCreate({
				place_id: arrowDBPlaceId,
				rating: '10'
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'createReview');
				assert(result.body.response);
				assert(result.body.response.reviews);
				arrowDBReviewCount = arrowDBReviewCount + 1;
				arrowDBReviewIds[0] = result.body.response.reviews[0].id;
				done();
			});
		});
		it('Should review the photo', function(done) {
			arrowDBApp.reviewsCreate({
				photo_id: arrowDBPhotoId,
				rating: '5',
				tags: 'cool,outside'
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'createReview');
				assert(result.body.response);
				assert(result.body.response.reviews);
				arrowDBReviewCount = arrowDBReviewCount + 1;
				arrowDBReviewIds[1] = result.body.response.reviews[0].id;
				done();
			});
		});
		it('Should return the review count', function(done) {
			arrowDBApp.reviewsCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				done();
			});
		});

		it('Should update the review', function(done) {
			arrowDBApp.reviewsUpdate({
				review_id: arrowDBReviewIds[0],
				place_id: arrowDBPlaceId,
				rating: '8'
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'updateReview');
				assert(result.body.response);
				assert(result.body.response.reviews);
				assert(result.body.response.reviews[0].rating);
				assert.equal(result.body.response.reviews[0].rating, '8');
				done();
			});
		});
		it('Should show the review', function(done) {
			arrowDBApp.reviewsShow({
				review_id: arrowDBReviewIds[1]
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'showReview');
				assert(result.body.response);
				assert(result.body.response.reviews);
				assert(result.body.response.reviews[0].tags);
				assert.equal(result.body.response.reviews[0].tags, 'cool,outside');
				done();
			});
		});
	});
	describe('quary reviews', function() {
		it('Should return all reviews', function(done) {
			arrowDBApp.reviewsQuery({
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
				assert.equal(result.body.meta.method_name, 'queryReviews');
				assert(result.body.response);
				assert(result.body.response.reviews);
				assert.equal(2, result.body.response.reviews.length);
				done();
			});
		});
	});
	describe('remove reviews', function() {
		it('Should delete reviews', function(done) {
			arrowDBApp.reviewsRemove({
				review_id: arrowDBReviewIds[1]
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				arrowDBReviewCount = arrowDBReviewCount - 1;
				done();
			});
		});
	});

	describe('Negative test', function() {
		it('create without passing object_id field', function(done) {
			arrowDBApp.reviewsCreate({}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Invalid review type');
				done();
			});
		});

		it('show using invalid review id', function(done) {
			arrowDBApp.reviewsShow({
				review_id: 'invalid'
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Invalid review id(s)');
				done();
			});
		});

		it('update using invalid review id', function(done) {
			arrowDBApp.reviewsUpdate({
				review_id: 'invalid'
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Invalid review type');
				done();
			});
		});

		it('delete using invalid review id', function(done) {
			arrowDBApp.reviewsRemove({
				review_id: 'invalid'
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Invalid review id');
				done();
			});
		});
	});
});
