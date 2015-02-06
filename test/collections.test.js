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
	arrowDBUserId = null,
	arrowDBPhotoId = null,
	arrowDBCollectionCount = 0,
	arrowDBCollectionId = [];

var timeout = 50000;

describe('Collections Test', function() {
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
		arrowDBApp.photoCollectionsCount(function(err, result) {
			assert.ifError(err);
			assert(result.body);
			assert(result.body.meta);
			assert.equal(result.body.meta.code, 200);
			done();
		});
	});
	describe('Create, update, count and show collection', function() {
		it('Should create a collection', function(done) {
			arrowDBApp.photoCollectionsCreate({
				name: 'Name'
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'createCollection');
				assert(result.body.response);
				assert(result.body.response.collections);
				arrowDBCollectionCount = arrowDBCollectionCount + 1;
				arrowDBCollectionId[0] = result.body.response.collections[0].id;
				done();
			});
		});

		it('Should create another collection', function(done) {
			arrowDBApp.photoCollectionsCreate({
				name: 'Name2',
				parent_collection_id: arrowDBCollectionId[0]
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'createCollection');
				assert(result.body.response);
				assert(result.body.response.collections);
				arrowDBCollectionCount = arrowDBCollectionCount + 1;
				arrowDBCollectionId[1] = result.body.response.collections[0].id;
				done();
			});
		});

		it('Should create a photo', function(done) {
			var photo_file = fs.createReadStream(__dirname + '/files/appcelerator.png');
			arrowDBApp.photosCreate({
				photo: photo_file,
				collection_id: arrowDBCollectionId[1],
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
				arrowDBPhotoId = result.body.response.photos[0].id;
				testUtil.processWait(arrowDBApp, 'photo', arrowDBPhotoId, done, 5000);
			});
		});

		it('Should return the collection count', function(done) {
			arrowDBApp.photoCollectionsCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				done();
			});
		});

		it('Should update the collection', function(done) {
			arrowDBApp.photoCollectionsUpdate({
				collection_id: arrowDBCollectionId[1],
				name: 'Name_ok'
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'updateCollection');
				assert(result.body.response);
				assert(result.body.response.collections);
				assert(result.body.response.collections[0].name);
				assert.equal(result.body.response.collections[0].name, 'Name_ok');
				done();
			});
		});
	});
	describe('search collections and show the photo', function() {
		it('Should return all collections', function(done) {
			arrowDBApp.photoCollectionsSearch({
				user_id: arrowDBUserId,
				limit: 100,
				q: 'Name'
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'searchCollections');
				assert(result.body.response);
				assert(result.body.response.collections);
				assert.equal(1, result.body.response.collections.length);
				done();
			});
		});
		it('Should return all subcollections', function(done) {
			arrowDBApp.photoCollectionsShowSubcollections({
				collection_id: arrowDBCollectionId[0]
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'showCollectionSubcollections');
				assert(result.body.response);
				assert(result.body.response.collections);
				assert.equal(1, result.body.response.collections.length);
				done();
			});
		});
		it('Should return all photo in collections', function(done) {
			arrowDBApp.photoCollectionsShowPhotos({
				collection_id: arrowDBCollectionId[1]
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'showCollectionPhotos');
				assert(result.body.response);
				assert(result.body.response.photos);
				assert.equal(1, result.body.response.photos.length);
				done();
			});
		});
	});
	describe('remove collections', function() {
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
		it('Should delete collection 1', function(done) {
			arrowDBApp.photoCollectionsRemove({
				collection_id: arrowDBCollectionId[1]
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				arrowDBCollectionCount = arrowDBCollectionCount - 1;
				done();
			});
		});
		it('Should delete collection 0', function(done) {
			arrowDBApp.photoCollectionsDelete({
				collection_id: arrowDBCollectionId[0]
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				arrowDBCollectionCount = arrowDBCollectionCount - 1;
				done();
			});
		});
		it('Should return none collections', function(done) {
			arrowDBApp.photoCollectionsCount({}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				done();
			});
		});
	});
});
