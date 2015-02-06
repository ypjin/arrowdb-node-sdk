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
	arrowDBApp = new ArrowDB(arrowDBKey),
	arrowDBAppFriend = new ArrowDB(arrowDBKey, {
		apiEntryPoint: arrowDBEntryPoint,
		prettyJson: true
	}),
	arrowDBUsername = null,
	arrowDBUserId,
	arrowDBPassword = 'cocoafish',
	arrowDBFriendUsername,
	arrowDBFriendUserId;

describe('Friends Test', function() {
	before(function(done) {
		testUtil.generateUsername(function(username) {
			arrowDBUsername = username;
			arrowDBFriendUsername = arrowDBUsername + '_friend';
			console.log('\tGenerated arrowdb user: %s', arrowDBUsername);
			done();
		});
	});

	describe('.createUser', function() {
		it('Should create user as friend successfully', function(done) {
			this.timeout(20000);
			arrowDBAppFriend.usersCreate({
				username: arrowDBFriendUsername,
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
				assert.equal(result.body.response.users[0].username, arrowDBFriendUsername);
				assert(result.body.response.users[0].id);
				arrowDBFriendUserId = result.body.response.users[0].id;

				arrowDBAppFriend.usersLogin({
					login: arrowDBFriendUsername,
					password: arrowDBPassword
				}, function (err, result) {
					assert.ifError(err);
					assert(result);
					done();
				});
			});
		});

		it('Should create general user successfully', function(done) {
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
				assert(result.body.response.users[0].id);
				arrowDBUserId = result.body.response.users[0].id;

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

	describe('.createFriends', function() {
		it('Should create friend successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.friendsAdd({
				user_ids: arrowDBFriendUserId
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'addFriends');
				done();
			});
		});
	});

	describe('.viewAndApproveFriends', function() {
		it('Should show pending friend successfully', function(done) {
			this.timeout(20000);
			arrowDBAppFriend.friendsRequests(function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'friendRequests');
				assert(result.body.response);
				assert(result.body.response.friend_requests);
				assert(result.body.response.friend_requests[0]);
				assert.equal(result.body.response.friend_requests[0].user_id, arrowDBUserId);
				assert(result.body.response.friend_requests[0].user);
				assert.equal(result.body.response.friend_requests[0].user.id, arrowDBUserId);
				assert.equal(result.body.response.friend_requests[0].user.username, arrowDBUsername);
				done();
			});
		});

		it('Should approve pending friend successfully', function(done) {
			this.timeout(20000);
			arrowDBAppFriend.friendsApprove({
				user_ids: arrowDBUserId
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'approveFriends');
				done();
			});
		});

		it('Should return approved friend successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.friendsQuery({
				limit: 100
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'queryFriends');
				assert(result.body.response);
				assert(result.body.response.users);
				assert(result.body.response.users[0]);
				assert.equal(result.body.response.users[0].id, arrowDBFriendUserId);
				assert.equal(result.body.response.users[0].username, arrowDBFriendUsername);
				done();
			});
		});
	});

	describe('.searchFriends', function() {
		it('Should return search result successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.friendsSearch(function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'searchFriends');
				assert(result.body.response);
				assert(result.body.response.users);
				assert(result.body.response.users[0]);
				assert.equal(result.body.response.users[0].id, arrowDBFriendUserId);
				assert.equal(result.body.response.users[0].username, arrowDBFriendUsername);
				done();
			});
		});
	});

	describe('.removeFriends', function() {
		it('Should remove friend successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.friendsRemove({
				user_ids: arrowDBFriendUserId
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'removeFriends');
				done();
			});
		});

		it('Should have deleted friend', function(done) {
			this.timeout(20000);
			arrowDBApp.friendsQuery({
				limit: 100
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'queryFriends');
				assert(result.body.response);
				assert(!result.body.response.users);
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

		it('Should delete friend successfully', function(done) {
			this.timeout(20000);
			arrowDBAppFriend.usersRemove(function(err, result) {
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
