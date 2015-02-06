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
	arrowDBPhotoCount = 0,
	arrowDBUserId = null,
	arrowDBPhotoId = null;

var timeout = 50000;

describe('Photos Test', function() {
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
		arrowDBApp.photosCount(function(err, result) {
			assert.ifError(err);
			assert(result.body);
			assert(result.body.meta);
			assert.equal(result.body.meta.code, 200);
			done();
		});
	});
	describe('Create, update, count and show photo', function() {
		it('Should create a photo', function(done) {
			var photo_file = fs.createReadStream(__dirname + '/files/appcelerator.png');
			arrowDBApp.photosCreate({
				photo: photo_file,
				title: 'test photo'
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'createPhoto');
				assert(result.body.response);
				assert(result.body.response.photos);
				arrowDBPhotoCount = arrowDBPhotoCount + 1;
				arrowDBPhotoId = result.body.response.photos[0].id;
				testUtil.processWait(arrowDBApp, 'photo', arrowDBPhotoId, done, 5000);
			});
		});

		it('Should return the photo count', function(done) {
			arrowDBApp.photosCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				done();
			});
		});

		it('Should update the photo', function(done) {
			arrowDBApp.photosUpdate({
				photo_id: arrowDBPhotoId,
				title: 'test photo 1'
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'updatePhoto');
				assert(result.body.response);
				assert(result.body.response.photos);
				assert(result.body.response.photos[0].title);
				assert.equal(result.body.response.photos[0].title, 'test photo 1');
				done();
			});
		});
	});
	describe('quary and search photos', function() {
		it('Quary should return all photos', function(done) {
			arrowDBApp.photosQuery({
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
				assert.equal(result.body.meta.method_name, 'queryPhoto');
				assert(result.body.response);
				assert(result.body.response.photos);
				assert.equal(1, result.body.response.photos.length);
				done();
			});
		});
		it('Search should return all photos', function(done) {
			arrowDBApp.photosSearch({
				limit: 100,
				q: 'title'
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'searchPhotos');
				assert(result.body.response);
				assert(result.body.response.photos);
				done();
			});
		});
	});
	describe('remove photo', function() {
		it('Should delete photo', function(done) {
			arrowDBApp.photosRemove({
				photo_id: arrowDBPhotoId
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				done();
			});
		});
	});
	describe('Negative test', function() {

		it('create without passing photo field', function(done) {
			arrowDBApp.photosCreate({}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Photo parameter required for photo upload');
				done();
			});
		});

		it('create using invalid photo field id', function(done) {
			arrowDBApp.photosCreate({
				photo: __dirname + '/files/invalidphotos.jpg'
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Invalid photo file attachment');
				done();
			});
		});

		it('show using invalid photo id', function(done) {
			arrowDBApp.photosShow({
				photo_id: 'invalid'
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Invalid photo id');
				done();
			});
		});

		it('update using invalid photo id', function(done) {
			arrowDBApp.photosUpdate({
				photo_id: 'invalid'
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Invalid photo id');
				done();
			});
		});

		it('delete using invalid photo id', function(done) {
			arrowDBApp.photosRemove({
				photo_id: 'invalid'
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Invalid photo id');
				done();
			});
		});
	});
});
