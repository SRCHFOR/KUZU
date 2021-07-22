process.env.MAIL_URL="smtps://mattlensing@gmail.com:"+Meteor.settings.gmailAppWord+"@smtp.gmail.com:465/";
Accounts.emailTemplates.siteName = "KUZU Producer Verification";
Accounts.emailTemplates.from = "KUZU Accounts <KUZUalerts@gmail.com>";
Accounts.emailTemplates.verifyEmail = {
	subject() {
		return "Activate your account now!";
	},
	text(user, url) {
		return `Hey ${user.emails[0].address}! Verify your e-mail by following this link: ${url}`;
	}
}
console.log(process.env.NODE_ENV)

Meteor.startup(function(){
	Meteor.setInterval(function() {
		Shows.find({ showStart: { $exists: true, $gte : new Date((new Date().toISOString())) } }).forEach(function(show){
														Meteor.users.find({"producerProfile.showStartReminderSubs": {$elemMatch: {$eq: show.userId}}}).forEach(function(subscriber){
															if(!show.startMsgSent && subscriber.producerProfile.isShowStartReminderEnabled){
																var timeNow = new moment(new Date()).valueOf()
																if ((show.tenMinutesPriorToShowTime()) && (timeNow <= show.showStart.getTime())){
																	let to = ''
																	let from = Accounts.emailTemplates.from
																	let subject = '"' + show.showName + '" is about to begin.'
																	let message = '"' + show.showName + '" is about to begin.'
																	for (var i = 0; i < subscriber.emails.length; i++){
																		to = subscriber.emails[i].address
    																	Email.send({ to, from, subject, message });
																	}
																	Shows.update({ _id: show._id }, { $set: { startMsgSent: true } })
																}
															}
														})
													})
  	}, 60000) //every minute

//     var users = Meteor.users.find().fetch();
//     _.each(users,function(userData){
//         if(userData.emails[0].address === 'meteor@meteor.com'){
//         	console.log(userData._id);
//         	Meteor.users.update({_id: userData._id},{$set: {isAdmin: true}});
//         }
//     });
});