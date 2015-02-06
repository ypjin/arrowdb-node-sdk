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
	arrowDBUsername = null,
	arrowDBUserId,
	arrowDBPassword = 'cocoafish',
	arrowDBSubscriptionChannel1,
	arrowDBSubscriptionChannel2,
	arrowDBSubscriptionToken1,
	arrowDBSubscriptionToken2,
	arrowDBSubscriptionsCount,
	arrowDBPayload = {
		alert: 'Push Notifications Test at ' + new Date().toISOString(),
		sound: 'default'
	};

describe('Push Notifications and Logs Test', function() {
	before(function(done) {
		testUtil.generateUsername(function(username) {
			arrowDBUsername = username;
			arrowDBSubscriptionChannel1 = arrowDBUsername + '_test_channel_1';
			arrowDBSubscriptionChannel2 = arrowDBUsername + '_test_channel_2';
			arrowDBSubscriptionToken1 = arrowDBUsername + '_test_token_1';
			arrowDBSubscriptionToken2 = arrowDBUsername + '_test_token_2';
			console.log('\tGenerated arrowdb user: %s', arrowDBUsername);
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

	describe('.subscribeAndUpdateTokensToUsers', function() {
		it('Should count subscriptions successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'push_notificationCount');
				assert(result.body.meta.count || (result.body.meta.count === 0));
				console.log('\tCurrent push subscriptions count: %s', result.body.meta.count);
				arrowDBSubscriptionsCount = result.body.meta.count;
				done();
			});
		});

		it('Should subscribe device token successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsSubscribe({
				type: 'gcm',
				channel: arrowDBSubscriptionChannel1,
				device_token: arrowDBSubscriptionToken1
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'SubscribeNotification');
				done();
			});
		});

		it('Should return increased subscription count correctly', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'push_notificationCount');
				assert(result.body.meta.count || (result.body.meta.count === 0));
				console.log('\tCurrent push subscriptions count: %s', result.body.meta.count);
				assert.equal(result.body.meta.count, arrowDBSubscriptionsCount + 1);
				done();
			});
		});

		it('Should update subscription successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsUpdateSubscription({
				device_token: arrowDBSubscriptionToken1,
				loc: [-122.050315, 37.389772]
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'UpdateSubscription');
				done();
			});
		});
	});

	describe('.setAndResetBadges', function() {
		it('Should set badge successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsSetBadge({
				device_token: arrowDBSubscriptionToken1,
				badge_number: 100
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'setBadge');
				done();
			});
		});

		it('Should query subscription correctly after setting badge', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsQuery({
				user_id: arrowDBUserId,
				device_token: arrowDBSubscriptionToken1
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'querySubscriptions');
				assert(result.body.response);
				assert(result.body.response.subscriptions);
				assert.equal(result.body.response.subscriptions[0].badge_number, 100);
				done();
			});
		});

		it('Should reset badge successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsResetBadge({
				device_token: arrowDBSubscriptionToken1
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'resetBadge');
				done();
			});
		});

		it('Should query subscription correctly after resetting badge', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsQuery({
				user_id: arrowDBUserId,
				device_token: arrowDBSubscriptionToken1
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'querySubscriptions');
				assert(result.body.response);
				assert(result.body.response.subscriptions);
				assert.equal(result.body.response.subscriptions[0].badge_number, 0);
				done();
			});
		});

		it('Should set badge again successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsSetBadge({
				device_token: arrowDBSubscriptionToken1,
				badge_number: 200
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'setBadge');
				done();
			});
		});

		it('Should query subscription correctly again after setting badge', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsQuery({
				user_id: arrowDBUserId,
				device_token: arrowDBSubscriptionToken1
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'querySubscriptions');
				assert(result.body.response);
				assert(result.body.response.subscriptions);
				assert.equal(result.body.response.subscriptions[0].badge_number, 200);
				done();
			});
		});

		it.skip('Should reset all badges successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsResetAllBadges(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				console.log(result);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'resetBadge');
				done();
			});
		});

		it.skip('Should query subscription correctly after setting badge', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsQuery({
				user_id: arrowDBUserId,
				device_token: arrowDBSubscriptionToken1
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'querySubscriptions');
				assert(result.body.response);
				assert(result.body.response.subscriptions);
				assert.equal(result.body.response.subscriptions[0].badge_number, 0);
				done();
			});
		});
	});

	describe('.subscribeTokens', function() {
		it('Should count subscriptions successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'push_notificationCount');
				assert(result.body.meta.count || (result.body.meta.count === 0));
				console.log('\tCurrent push subscriptions count: %s', result.body.meta.count);
				arrowDBSubscriptionsCount = result.body.meta.count;
				done();
			});
		});

		it('Should subscribe device token successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsSubscribeToken({
				type: 'gcm',
				channel: arrowDBSubscriptionChannel2,
				device_token: arrowDBSubscriptionToken2
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'SubscribeNotificationByToken');
				done();
			});
		});

		it('Should return increased subscription count correctly', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'push_notificationCount');
				assert(result.body.meta.count || (result.body.meta.count === 0));
				console.log('\tCurrent push subscriptions count: %s', result.body.meta.count);
				assert.equal(result.body.meta.count, arrowDBSubscriptionsCount + 1);
				done();
			});
		});
	});

	describe('.queryAndShowChannels', function() {
		it('Should query channel successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsQueryChannels(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'queryPushChannels');
				assert(result.body.response);
				assert(result.body.response.push_channels);
				assert(result.body.response.push_channels.indexOf(arrowDBSubscriptionChannel1) !== -1);
				done();
			});
		});

		it.skip('Should show channel successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsShowChannels({
				name: arrowDBSubscriptionChannel1
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				console.log(JSON.stringify(result.body, null, 2));
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'showPushChannels');
				assert(result.body.response);
				assert(result.body.response.push_channels);
				assert(result.body.response.push_channels.indexOf(arrowDBSubscriptionChannel1) !== -1);
				done();
			});
		});
	});

	describe.skip('.notifyAndNotifyTokens', function() {
		it('Should notify successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsNotify({
				channel: arrowDBSubscriptionChannel1,
				to_ids: arrowDBUserId,
				payload: arrowDBPayload
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'Notify');
				done();
			});
		});

		it('Should notify tokens successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsNotifyTokens({
				channel: arrowDBSubscriptionChannel1,
				to_tokens: arrowDBSubscriptionToken2,
				payload: arrowDBPayload
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'NotifyTokens');
				done();
			});
		});
	});

	describe('.queryPushLogs', function() {
		it.skip('Should query push log successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.logsQueryPushLogs(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				console.log(JSON.stringify(result.body, null, 2));
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'queryPushChannels');
				assert(result.body.response);
				assert(result.body.response.push_channels);
				assert(result.body.response.push_channels.indexOf(arrowDBSubscriptionChannel1) !== -1);
				done();
			});
		});

		it.skip('Should query push detail log successfully', function(done) {
			this.timeout(20000);
			done();
		});
	});

	describe('.unsubscribeTokensFromUsers', function() {
		it('Should unsubscribe device token successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsUnsubscribe({
				device_token: arrowDBSubscriptionToken1
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'UnsubscribeNotification');
				done();
			});
		});

		it('Should query subscription correctly after unsubscription', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsQuery({
				user_id: arrowDBUserId,
				device_token: arrowDBSubscriptionToken1
			}, function(err, result) {
				assert.ifError(err);
				assert(result);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'querySubscriptions');
				assert(result.body.response);
				assert(result.body.response.subscriptions);
				assert.equal(result.body.response.subscriptions.length, 0);
				done();
			});
		});
	});

	describe('.unsubscribeTokens', function() {
		it('Should count subscriptions successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'push_notificationCount');
				assert(result.body.meta.count || (result.body.meta.count === 0));
				console.log('\tCurrent push subscriptions count: %s', result.body.meta.count);
				arrowDBSubscriptionsCount = result.body.meta.count;
				done();
			});
		});

		it('Should unsubscribe device token successfully', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsUnsubscribeToken({
				device_token: arrowDBSubscriptionToken2
			}, function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'UnsubscribeNotificationByToken');
				done();
			});
		});

		it('Should return decreased subscription count correctly', function(done) {
			this.timeout(20000);
			arrowDBApp.pushNotificationsCount(function(err, result) {
				assert.ifError(err);
				assert(result.body);
				assert(result.body.meta);
				assert.equal(result.body.meta.code, 200);
				assert.equal(result.body.meta.method_name, 'push_notificationCount');
				assert(result.body.meta.count || (result.body.meta.count === 0));
				console.log('\tCurrent push subscriptions count: %s', result.body.meta.count);
				assert.equal(result.body.meta.count, arrowDBSubscriptionsCount - 1);
				done();
			});
		});

	});

	describe('.deleteUser', function() {
		it('Should delete user successfully', function(done) {
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
