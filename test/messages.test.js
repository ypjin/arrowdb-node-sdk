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
	subject = 'New SDK!',
	body = 'ArrowDB Node SDK Redesign Test - messages',
	arrowDBUser1_id = null,
	message_id = null,
	reply_message_id = null,
	thread_id = null;


describe('Messages Test', function() {
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

	describe('Positive messages tests', function() {
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

				arrowDBApp.usersLogin({
					login: arrowDBUsername_2,
					password: arrowDBPassword
				}, function (err, result) {
					assert.ifError(err);
					assert(result);
					done();
				});
			});
		});

		it('Should send message to user 1 successfully', function(done) {
			arrowDBApp.messagesCreate({
				to_ids: arrowDBUser1_id,
				body: body,
				subject: subject
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'createMessage');
				var obj = result.body.response.messages[0];
				message_id = obj.id;
				thread_id = obj.thread_id;
				assert.equal(obj.body, body);
				assert.equal(obj.subject, subject);
				done();
			});
		});

		it('Should show a message successfully', function(done) {
			arrowDBApp.messagesShow({
				message_id: message_id
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'showMessage');
				var obj = result.body.response.messages[0];
				message_id = obj.id;
				assert.equal(obj.body, body);
				assert.equal(obj.subject, subject);
				done();
			});
		});

		it('Should show sent messages successfully', function(done) {
			arrowDBApp.messagesShowSent({}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'showMessagesSent');
				var obj = result.body.response.messages[0];
				message_id = obj.id;
				assert.equal(obj.body, body);
				assert.equal(obj.subject, subject);
				assert.equal(obj.status, 'sent');
				done();
			});
		});

		it('Should show a message thread successfully', function(done) {
			arrowDBApp.messagesShowThread({
				thread_id: thread_id
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'showThreadMessages');
				var obj = result.body.response.messages[0];
				assert.equal(obj.body, body);
				assert.equal(obj.subject, subject);
				assert.equal(obj.status, 'sent');
				done();
			});
		});

		it('Should query messages successfully', function(done) {
			arrowDBApp.messagesQuery({}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'queryMessages');
				done();
			});
		});

		it('User 1 should be able to login successfully', function(done) {
			arrowDBApp.usersLogin({
				login: arrowDBUsername_1,
				password: arrowDBPassword
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'loginUser');
				var obj = result.body.response.users[0];
				assert.equal(obj.username, arrowDBUsername_1);
				done();
			});
		});

		it('Should show message threads successfully', function(done) {
			arrowDBApp.messagesShowThreads({}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'showThreads');
				var obj = result.body.response.messages[0];
				assert.equal(obj.body, body);
				assert.equal(obj.subject, subject);
				assert.equal(obj.status, 'unread');
				done();
			});
		});

		it('Should show inbox messages successfully', function(done) {
			arrowDBApp.messagesShowInbox({}, function(err, result) {
				assert.ifError(err);
				assert(result.body);

				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'showMessagesInbox');
				var obj = result.body.response.messages[0];
				assert.equal(obj.body, body);
				assert.equal(obj.subject, subject);
				assert.equal(obj.status, 'unread');
				done();
			});
		});

		it('Should reply a message to user 2 successfully', function(done) {
			var body = 'Thanks for your invitation.';
			arrowDBApp.messagesReply({
				message_id: message_id,
				body: 'Thanks for your invitation.'
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'replyMessage');
				var obj = result.body.response.messages[0];
				reply_message_id = obj.id;
				assert.equal(obj.body, body);
				assert.equal(obj.status, 'sent');
				done();
			});
		});

		it('Should count messages successfully', function(done) {
			arrowDBApp.messagesCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				done();
			});
		});

		it('Should delete a thread successfully', function(done) {
			arrowDBApp.messagesDeleteThread({
				thread_id: thread_id
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'deleteMessageThread');
				done();
			});
		});
	});

	describe('Negative messages tests', function() {
		it('Should fail to send message to user 1 without body', function(done) {
			arrowDBApp.messagesReply({
				message_id: message_id
			}, function(err) {
				//                assert.equal(err !== undefined, true);
				//                assert.equal(err.message, 'Required parameter body is missing.');
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.method_name, 'replyMessage');
				done();
			});
		});

		it('Should fail to send message to user 1 without message_id', function(done) {
			arrowDBApp.messagesReply({
				body: body
			}, function(err) {
				//                assert.equal(err !== undefined, true);
				//                assert.equal(err.message, 'Required parameter message_id is missing.');
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.method_name, 'replyMessage');
				done();
			});
		});

		it('Should fail to send message to user 1 without body', function(done) {
			arrowDBApp.messagesCreate({
				to_ids: arrowDBUser1_id,
				subject: subject
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Failed to send message: Validation failed - Body can\'t be blank.');
				done();
			});
		});

		it('Should fail to show a message without message_id', function(done) {
			arrowDBApp.messagesShow({}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.message, 'Required field: message_id');
				done();
			});
		});

		it('Should reply a message to user 2 successfully', function(done) {
			arrowDBApp.messagesReply({
				message_id: message_id
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.method_name, 'replyMessage');
				done();
			});
		});

		it('Should fail delete a thread without thread_id', function(done) {
			arrowDBApp.messagesDeleteThread({}, function(err) {
				//                assert.equal(err !== undefined, true);
				//                assert.equal(err.message, 'Required parameter thread_id is missing.');
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.method_name, 'deleteMessageThread');
				done();
			});
		});
	});

	describe('cleanup', function() {

		it('Should delete a message successfully', function(done) {
			arrowDBApp.messagesDelete({
				message_id: message_id
			}, function(err) {
				assert(err);
				assert.equal(err.statusCode, 400);
				assert.equal(err.body.meta.method_name, 'deleteMessage');
				done();
			});
		});

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
