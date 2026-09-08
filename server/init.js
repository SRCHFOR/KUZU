//process.env.MAIL_URL="smtps://put@email.here:"+Meteor.settings.gmailAppWord+"@smtp.gmail.com:465/";
process.env.MAIL_URL="smtps://kuzu929fm@gmail.com:"+Meteor.settings.gmailAppWord+"@smtp.gmail.com:465/";

//process.env.ROOT_URL="http://localhost:3000/"
process.env.ROOT_URL="http://producer.kuzu.fm/"

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
	
	//Pre-sort Tracklists and Shows for the showStats download
	Tracklists.rawCollection().createIndex({ userId: 1, indexNumber: 1, _id: 1 });
  	Shows.rawCollection().createIndex({ showName: 1, _id: 1 });	
	
	//Send reminder emails
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

	//Register URI traffic cop
	const trafficCop = (req, res, next) => {
    	try {
			//Test if the URL is valid.
      		decodeURI(req.url);
      		next();
    	} 
		catch (error) {
      		if (error instanceof URIError) {
				//extract IP and url from request
        		const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        		console.warn(`[Bad Request Blocked] Malformed URI from IP: ${ip} - Path: ${req.url}`);
        
        		//Reject the request and close the connection
        		res.writeHead(400, { 'Content-Type': 'text/plain' });
        		res.end('Bad Request: Malformed URI');
      		} 
			else {
				//Don't print unknown error on client
				console.error(error)
        		res.writeHead(500, { 'Content-Type': 'text/plain' });
        		res.end('Internal Server Error');
      		}
    	}
	}
	//Move trafficCop handler to top of routes
	WebApp.connectHandlers.stack.unshift({
    	route: '', //All URLs
    	handle: trafficCop
  	})

	//counts for fun
	Meteor.call('getAllUserCounts', function(error, result){
									if (!!error){
										console.log("error on getAllUserShows from init startup")
										console.log(error)
										console.log(error.reason)
									}
									else{
										console.log('')
										console.log('******************************************')
										console.log('************ Counts Begin ****************')
										console.log('******************************************')
										console.log('Username|ProfileName|ProducerName|ShowName|ShowTotal|TrackTotal')
										_.each(result, function(result) {
											console.log(result.users.username + '|' + result.users.profile?.name + '|' + result.users.producerProfile.name + '|' + result.users.producerProfile.showName + '|' + result.totalShows + '|' + result.totalTracks)
    									})
										console.log('******************************************')
										console.log('************ Counts End ******************')
										console.log('******************************************')
										console.log('')
									}
								})

//     var users = Meteor.users.find().fetch();
//     _.each(users,function(userData){
//         if(userData.emails[0].address === 'meteor@meteor.com'){
//         	console.log(userData._id);
//         	Meteor.users.update({_id: userData._id},{$set: {isAdmin: true}});
//         }
//     });
});