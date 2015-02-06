var ArrowDB = require('../index'),
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

var arrowDBUsername = null,
	arrowDBPassword = 'cocoafish',

	arrowDBReaderUsername1,
	arrowDBReaderUserId1,

	arrowDBReaderUsername2,
	arrowDBReaderUserId2,

	arrowDBWriterUsername1,
	arrowDBWriterUserId1,

	arrowDBWriterUsername2,
	arrowDBWriterUserId2,

	arrowDBACLName = 'aclTest',
	arrowDBACLsCount = 0;


describe('ACLs Test', function() {
	before(function(done) {
		this.arrowDBAppGeneral = new ArrowDB(arrowDBKey, {
			apiEntryPoint: arrowDBEntryPoint,
			prettyJson: true
		});

		this.arrowDBAppReader1 = new ArrowDB(arrowDBKey, {
			apiEntryPoint: arrowDBEntryPoint,
			prettyJson: true
		});

		this.arrowDBAppReader2 = new ArrowDB(arrowDBKey, {
			apiEntryPoint: arrowDBEntryPoint,
			prettyJson: true
		});

		this.arrowDBAppWriter1 = new ArrowDB(arrowDBKey, {
			apiEntryPoint: arrowDBEntryPoint,
			prettyJson: true
		});

		this.arrowDBAppWriter2 = new ArrowDB(arrowDBKey, {
			apiEntryPoint: arrowDBEntryPoint,
			prettyJson: true
		});

		testUtil.generateUsername(function(username) {
			arrowDBUsername = username;
			arrowDBReaderUsername1 = arrowDBUsername + '_reader_1';
			arrowDBReaderUsername2 = arrowDBUsername + '_reader_2';
			arrowDBWriterUsername1 = arrowDBUsername + '_writer_1';
			arrowDBWriterUsername2 = arrowDBUsername + '_writer_2';
			console.log('\tGenerated arrowdb user: %s', arrowDBUsername);
			done();
		});
	});

	describe('.createUser', function() {
		it('Should create user as ACL reader 1 successfully', function(done) {
			this.timeout(20000);
			this.arrowDBAppReader1.usersCreate({
				username: arrowDBReaderUsername1,
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
				assert.equal(result.body.response.users[0].username, arrowDBReaderUsername1);
				assert(result.body.response.users[0].id);
				arrowDBReaderUserId1 = result.body.response.users[0].id;

				this.arrowDBAppReader1.usersLogin({
					login: arrowDBReaderUsername1,
					password: arrowDBPassword
				}, function(err, result) {
					assert.ifError(err);
					assert(result);
					done();
				});
			}.bind(this));
		});

		it('Should create user as ACL reader 2 successfully', function(done) {
			this.timeout(20000);
			this.arrowDBAppReader2.usersCreate({
				username: arrowDBReaderUsername2,
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
				assert.equal(result.body.response.users[0].username, arrowDBReaderUsername2);
				assert(result.body.response.users[0].id);
				arrowDBReaderUserId2 = result.body.response.users[0].id;

				this.arrowDBAppReader2.usersLogin({
					login: arrowDBReaderUsername2,
					password: arrowDBPassword
				}, function(err, result) {
					assert.ifError(err);
					assert(result);
					done();
				});
			}.bind(this));
		});

		it('Should create user as ACL writer 1 successfully', function(done) {
			this.timeout(20000);
			this.arrowDBAppWriter1.usersCreate({
				username: arrowDBWriterUsername1,
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
				assert.equal(result.body.response.users[0].username, arrowDBWriterUsername1);
				assert(result.body.response.users[0].id);
				arrowDBWriterUserId1 = result.body.response.users[0].id;

				this.arrowDBAppWriter1.usersLogin({
					login: arrowDBWriterUsername1,
					password: arrowDBPassword
				}, function(err, result) {
					assert.ifError(err);
					assert(result);
					done();
				});
			}.bind(this));
		});

		it('Should create user as ACL writer 2 successfully', function(done) {
			this.timeout(20000);
			this.arrowDBAppWriter2.usersCreate({
				username: arrowDBWriterUsername2,
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
				assert.equal(result.body.response.users[0].username, arrowDBWriterUsername2);
				assert(result.body.response.users[0].id);
				arrowDBWriterUserId2 = result.body.response.users[0].id;

				this.arrowDBAppWriter2.usersLogin({
					login: arrowDBWriterUsername2,
					password: arrowDBPassword
				}, function(err, result) {
					assert.ifError(err);
					assert(result);
					done();
				});
			}.bind(this));
		});

		it('Should create general user successfully', function(done) {
			this.timeout(20000);
			this.arrowDBAppGeneral.usersCreate({
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

				this.arrowDBAppGeneral.usersLogin({
					login: arrowDBUsername,
					password: arrowDBPassword
				}, function(err, result) {
					assert.ifError(err);
					assert(result);
					done();
				});
			}.bind(this));
		});
	});

	describe('.queryAndCountACLs', function() {
		it('Should return all ACLs', function(done) {
			this.timeout(20000);
			this.arrowDBAppGeneral.aclsQuery({
				limit: 100
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'queryACL');
				assert(result.body.response);
				assert(result.body.response.acls);
				arrowDBACLsCount = result.body.response.acls.length;
				assert.equal(typeof arrowDBACLsCount, 'number');
				done();
			});
		});

		it('Should return the correct ACL number as queried before', function(done) {
			this.timeout(20000);
			this.arrowDBAppGeneral.aclsCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'aclsCount');
				assert(result.body.meta.count || (result.body.meta.count === 0));
				console.log('\tCurrent acls count: %s', result.body.meta.count);
				assert.equal(result.body.meta.count, arrowDBACLsCount);
				done();
			});
		});
	});

	describe('.createACL', function() {
		it('Should create ACL successfully', function(done) {
			this.timeout(20000);
			this.arrowDBAppGeneral.aclsCreate({
				name: arrowDBACLName,
				reader_ids: arrowDBReaderUserId1,
				writer_ids: arrowDBWriterUserId1
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'createAcl');
				assert(result.body.response);
				assert(result.body.response.acls);
				assert(result.body.response.acls[0]);
				assert.equal(result.body.response.acls[0].name, arrowDBACLName);
				done();
			});
		});

		it('ACLs count should be increased', function(done) {
			this.timeout(20000);
			this.arrowDBAppGeneral.aclsCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'aclsCount');
				assert(result.body.meta.count || (result.body.meta.count === 0));
				assert.equal(typeof result.body.meta.count, 'number');
				console.log('\tCurrent acls count: %s', result.body.meta.count);
				assert.equal(result.body.meta.count, arrowDBACLsCount + 1);
				done();
			});
		});

		it('Should query ACL correctly', function(done) {
			this.timeout(20000);
			this.arrowDBAppGeneral.aclsQuery({
				where: {
					name: arrowDBACLName
				}
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'queryACL');
				assert(result.body.response);
				assert(result.body.response.acls);
				assert(result.body.response.acls[0]);
				assert.equal(result.body.response.acls[0].name, arrowDBACLName);
				done();
			});
		});
	});

	describe('.checkACL', function() {
		it('Should check ACL successfully', function(done) {
			this.timeout(20000);
			this.arrowDBAppGeneral.aclsCheckUser({
				name: arrowDBACLName,
				user_id: arrowDBWriterUserId1
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'checkAcl');
				assert(result.body.response);
				assert(result.body.response.permission);
				assert.equal(result.body.response.permission.read_permission, false);
				assert.equal(result.body.response.permission.write_permission, true);
				done();
			});
		});
	});

	describe('.addRemoveACLUser', function() {
		it('Should query ACL correctly without arrowDBReaderUser2 and arrowDBWriterUser2', function(done) {
			this.timeout(20000);
			this.arrowDBAppGeneral.aclsQuery({
				where: {
					name: arrowDBACLName
				}
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'queryACL');
				assert(result.body.response);
				assert(result.body.response.acls);
				assert(result.body.response.acls[0]);
				assert(result.body.response.acls[0].readers);
				assert(result.body.response.acls[0].readers.indexOf(arrowDBReaderUserId2) === -1);
				assert(result.body.response.acls[0].writers);
				assert(result.body.response.acls[0].writers.indexOf(arrowDBWriterUserId2) === -1);
				done();
			});
		});

		it('Should add arrowDBReaderUser2 and arrowDBWriterUser2 into ACL successfully', function(done) {
			this.timeout(20000);
			this.arrowDBAppGeneral.aclsAddUser({
				name: arrowDBACLName,
				reader_ids: arrowDBReaderUserId2,
				writer_ids: arrowDBWriterUserId2
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'addAcl');
				done();
			});
		});

		it('Should query ACL correctly with arrowDBReaderUser2 and arrowDBWriterUser2', function(done) {
			this.timeout(20000);
			this.arrowDBAppGeneral.aclsQuery({
				where: {
					name: arrowDBACLName
				}
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'queryACL');
				assert(result.body.response);
				assert(result.body.response.acls);
				assert(result.body.response.acls[0]);
				assert(result.body.response.acls[0].readers);
				assert(result.body.response.acls[0].readers.indexOf(arrowDBReaderUserId2) !== -1);
				assert(result.body.response.acls[0].writers);
				assert(result.body.response.acls[0].writers.indexOf(arrowDBWriterUserId2) !== -1);
				done();
			});
		});

		it('Should remove arrowDBReaderUser2 and arrowDBWriterUser2 from ACL successfully', function(done) {
			this.timeout(20000);
			this.arrowDBAppGeneral.aclsRemoveUser({
				name: arrowDBACLName,
				reader_ids: arrowDBReaderUserId2,
				writer_ids: arrowDBWriterUserId2
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'removeAcl');
				done();
			});
		});

		it('Should query ACL correctly without arrowDBReaderUser2 and arrowDBWriterUser2', function(done) {
			this.timeout(20000);
			this.arrowDBAppGeneral.aclsQuery({
				where: {
					name: arrowDBACLName
				}
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'queryACL');
				assert(result.body.response);
				assert(result.body.response.acls);
				assert(result.body.response.acls[0]);
				assert(result.body.response.acls[0].readers);
				assert(result.body.response.acls[0].readers.indexOf(arrowDBReaderUserId2) === -1);
				assert(result.body.response.acls[0].writers);
				assert(result.body.response.acls[0].writers.indexOf(arrowDBWriterUserId2) === -1);
				done();
			});
		});
	});

	describe('.removeACL', function() {
		it('Should check ACL successfully', function(done) {
			this.timeout(20000);
			this.arrowDBAppGeneral.aclsRemove({
				name: arrowDBACLName
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'deleteAcl');
				done();
			});
		});
	});

	describe('.deleteUser', function() {
		it('Should delete current user successfully', function(done) {
			this.timeout(20000);
			this.arrowDBAppGeneral.usersRemove(function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'deleteUser');
				done();
			});
		});

		it('Should delete reader 1 successfully', function(done) {
			this.timeout(20000);
			this.arrowDBAppReader1.usersRemove(function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'deleteUser');
				done();
			});
		});

		it('Should delete reader 2 successfully', function(done) {
			this.timeout(20000);
			this.arrowDBAppReader2.usersRemove(function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'deleteUser');
				done();
			});
		});

		it('Should delete writer 1 successfully', function(done) {
			this.timeout(20000);
			this.arrowDBAppWriter1.usersRemove(function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'deleteUser');
				done();
			});
		});

		it('Should delete writer 2 successfully', function(done) {
			this.timeout(20000);
			this.arrowDBAppWriter2.usersRemove(function(err, result) {
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
