process.env.MAIL_URL="smtps://mattlensing@gmail.com:"+Meteor.settings.gmailAppWord+"@smtp.gmail.com:465/";
//process.env.MAIL_URL="smtps://kuzu929fm@gmail.com:"+Meteor.settings.gmailAppWord+"@smtp.gmail.com:465/";
process.env.ROOT_URL="http://localhost:3000/"
//process.env.ROOT_URL="http://producer.kuzu.fm/"
Accounts.emailTemplates.siteName = "KUZU Producer Verification";
Accounts.emailTemplates.from = "KUZU Accounts <KUZU929FM@GMAIL.COM>";
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
	Meteor.absoluteUrl.defaultOptions.secure = false
	Meteor.absoluteUrl.defaultOptions.rootUrl = process.env.ROOT_URL	
	
	Meteor.setInterval(function() {
		Shows.find({ showStart: { $exists: true, $gte : new Date((new Date().toISOString())) } }).forEach(function(show){
														Meteor.users.find({"producerProfile.showStartReminderSubs": {$elemMatch: {$eq: show.userId}}}).forEach(function(subscriber){
															if(!show.startMsgSent && subscriber.producerProfile.isShowStartReminderEnabled){
																var timeNow = new moment(new Date()).valueOf()
																if ((show.tenMinutesPriorToShowTime()) && (timeNow <= show.showStart.getTime())){
																	let to = ''
																	let from = Accounts.emailTemplates.from
																	let subject = 'A KUZU show is about to begin.'
																	let text = '"' + show.showName + '" will begin in about 10 mins.'
																	for (var i = 0; i < subscriber.emails.length; i++){
																		to = subscriber.emails[i].address
    																	Email.send({ to, from, subject, text });
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