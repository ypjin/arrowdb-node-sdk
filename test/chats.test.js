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
	arrowDBUsername_1 = null,
	arrowDBPassword = 'cocoafish',
	arrowDBUsername_2 = null,
	message = 'ArrowDB Node SDK Redesign Test - chats',
	arrowDBUser1_id = null,
	chat_group_id = null,
	chat_id = null;


describe('Chats Test', function() {
	this.timeout(50000);
	before(function(done) {
		testUtil.generateUsername(function(username) {
			arrowDBUsername_1 = username;
			console.log('\tGenerated arrowdb user 1: %s', arrowDBUsername_1);
			testUtil.generateUsername(function(username) {
				arrowDBUsername_2 = username;
				console.log('\tGenerated arrowdb user 2: %s', arrowDBUsername_2);
				done();
			});
		});
	});

	describe('create user', function() {
		it('Should create user 1 successfully', function(done) {
			arrowDBApp.usersCreate({
				username: arrowDBUsername_1,
				password: arrowDBPassword,
				password_confirmation: arrowDBPassword
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'createUser');
				var obj = result.body.response.users[0];
				assert.equal(obj.username, arrowDBUsername_1);
				arrowDBUser1_id = obj.id;
				done();
			});
		});

		it('Should create user 2 successfully', function(done) {
			arrowDBApp.usersCreate({
				username: arrowDBUsername_2,
				password: arrowDBPassword,
				password_confirmation: arrowDBPassword
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'createUser');
				var obj = result.body.response.users[0];
				assert.equal(obj.username, arrowDBUsername_2);
				done();
			});
		});
	});

	describe('positive chats tests', function() {
		it('User 2 should be able to login successfully', function(done) {
			arrowDBApp.usersLogin({
				login: arrowDBUsername_2,
				password: arrowDBPassword
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'loginUser');
				var obj = result.body.response.users[0];
				assert.equal(obj.username, arrowDBUsername_2);
				done();
			});
		});

		it('Should send message to user 1 successfully - create', function(done) {
			arrowDBApp.chatsCreate({
				to_ids: arrowDBUser1_id,
				message: message,
				response_json_depth: 3
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'createChatMessage');
				var obj = result.body.response.chats[0];
				assert.equal(obj.message, message);
				chat_group_id = obj.chat_group.id;
				chat_id = obj.id;
				done();
			});
		});

		it('Should send message to chat group successfully - create', function(done) {
			arrowDBApp.chatsCreate({
				chat_group_id: chat_group_id,
				message: message
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'createChatMessage');
				var obj = result.body.response.chats[0];
				assert.equal(obj.message, message);
				done();
			});
		});

		it('Should query chats successfully - query', function(done) {
			arrowDBApp.chatsQuery({
				participate_ids: arrowDBUser1_id
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'queryChatMessages');
				var obj = result.body.response.chats[0];
				assert.equal(obj.message, message);
				done();
			});
		});

		it('Should get chat groups that user 1 participates in successfully - get_chat_groups', function(done) {
			arrowDBApp.chatsGetChatGroups({

			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'getChatGroups');
				var obj = result.body.response.chat_groups[0];
				assert.equal(obj.message, message);
				done();
			});
		});

		it('Should fail to query chat groups - query_chat_groups', function(done) {
			arrowDBApp.chatsQueryChatGroups({

			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 403);
				done();
			});
		});

		it('Should get the count of chats successfully - count', function(done) {
			arrowDBApp.chatsCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'chatsCount');
				done();
			});
		});

		it('Should delete chat that user 1 participates in successfully - delete', function(done) {
			arrowDBApp.chatsDelete({
				chat_id: chat_id
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'deleteChat');
				done();
			});
		});
	});

	describe('negative chats tests', function() {
		it('User 2 should be able to login successfully', function(done) {
			arrowDBApp.usersLogin({
				login: arrowDBUsername_2,
				password: arrowDBPassword
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'loginUser');
				var obj = result.body.response.users[0];
				assert.equal(obj.username, arrowDBUsername_2);
				done();
			});
		});

		it('Should fail to send message to user 1 successfully - create', function(done) {
			arrowDBApp.chatsCreate({
				//                to_ids: arrowDBUser1_id,
				message: message
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
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
