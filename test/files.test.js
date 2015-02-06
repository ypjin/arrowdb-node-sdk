var fs = require('fs'),
	assert = require('assert'),
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
	arrowDBFileId,
	arrowDBFileName,
	arrowDBFileNewName,
	arrowDBFilesCount = 0;

describe('Files Test', function() {
	before(function(done) {
		testUtil.generateUsername(function(username) {
			arrowDBUsername = username;
			console.log('\tGenerated arrowdb user: %s', arrowDBUsername);
			arrowDBFileName = arrowDBUsername + '_testfile';
			arrowDBFileNewName = arrowDBUsername + '_testnewfile';
			done();
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
				assert(result.cookieString);

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
	});

	describe('.queryAndCountFiles', function() {
		it('Should return all Files', function(done) {
			this.timeout(20000);
			arrowDBApp.filesQuery({
				limit: 100
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'queryFiles');
				assert(result.body.response);
				assert(result.body.response.files);
				arrowDBFilesCount = result.body.response.files.length;
				assert.equal(typeof arrowDBFilesCount, 'number');
				done();
			});
		});

		it('Should return the correct ACL number as queried before', function(done) {
			this.timeout(20000);
			arrowDBApp.filesCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'filesCount');
				assert(result.body.meta.count || (result.body.meta.count === 0));
				console.log('\tCurrent files count: %s', result.body.meta.count);
				arrowDBFilesCount = result.body.meta.count;
				assert.equal(result.body.meta.count, arrowDBFilesCount);
				done();
			});
		});
	});

	describe('.createFile', function() {
		it('Should create file successfully', function(done) {
			this.timeout(20000);
			var file = fs.createReadStream(__dirname + '/files/appcelerator.png');
			arrowDBApp.filesCreate({
				name: arrowDBFileName,
				file: file
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'createFile');
				assert(result.body.response);
				assert(result.body.response.files);
				assert(result.body.response.files[0]);
				assert(result.body.response.files[0].id);
				arrowDBFileId = result.body.response.files[0].id;
				assert.equal(result.body.response.files[0].name, arrowDBFileName);
				done();
			});
		});

		it('Files count should be increased', function(done) {
			this.timeout(20000);
			arrowDBApp.filesCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'filesCount');
				assert(result.body.meta.count || (result.body.meta.count === 0));
				console.log('\tCurrent files count: %s', result.body.meta.count);
				assert.equal(result.body.meta.count, arrowDBFilesCount + 1);
				done();
			});
		});

		it('Should query File correctly', function(done) {
			this.timeout(20000);
			arrowDBApp.filesQuery({
				where: {
					name: arrowDBFileName
				}
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'queryFiles');
				assert(result.body.response);
				assert(result.body.response.files);
				assert(result.body.response.files[0]);
				assert.equal(result.body.response.files[0].name, arrowDBFileName);
				assert.equal(result.body.response.files[0].id, arrowDBFileId);
				// assert(result.body.response.files[0].url);
				done();
			});
		});
	});

	describe('.showAndUpdateFile', function() {
		it('Should show file successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.filesShow({
				file_id: arrowDBFileId
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'showFile');
				assert(result.body.response);
				assert(result.body.response.files);
				assert(result.body.response.files[0]);
				assert.equal(result.body.response.files[0].name, arrowDBFileName);
				assert.equal(result.body.response.files[0].id, arrowDBFileId);
				// assert(result.body.response.files[0].url);
				done();
			});
		});

		it('Should update file successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.filesUpdate({
				file_id: arrowDBFileId,
				name: arrowDBFileNewName
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'updateFile');
				assert(result.body.response);
				assert(result.body.response.files);
				assert(result.body.response.files[0]);
				assert.equal(result.body.response.files[0].name, arrowDBFileNewName);
				assert.equal(result.body.response.files[0].id, arrowDBFileId);
				// assert(result.body.response.files[0].url);
				done();
			});
		});
	});

	describe('.deleteFile', function() {
		it('Should delete file successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.filesRemove({
				file_id: arrowDBFileId
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'deleteFile');
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
});
