var imInonLogout = 0
Accounts.config({
  forbidClientAccountCreation: false,
  sendVerificationEmail: true,
  loginExpirationInDays: 5,
})
Accounts.onLogout(function(obj){
	if (!Object.is(obj.user, null)){
		var userId = obj.user._id
		var sessions = _.filter(Meteor.default_server.sessions, function (session) {
        	return session.userId == userId;
		});

    	_.each(sessions, function (session) {
        	session.connectionHandle.close();
    	});
		imInonLogout = 1
	}
	else{
		if(imInonLogout != 1){
			console.log('bad logout')
		}
		else{
			imInonLogout = 0
		}
	}
})