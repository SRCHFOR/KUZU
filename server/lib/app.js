App = {}
App.fillAutoDJTrack = function() {
  if (
    App.autoDJTrack &&
    !Shows.findOne({ isActive: true, hasRadioLogikTracking: true })
  ) {
    Tracklists.insert({
      artist: App.autoDJTrack.artist,
      songTitle: App.autoDJTrack.songTitle,
      album: App.autoDJTrack.album,
      label: App.autoDJTrack.label,
      trackLength: App.autoDJTrack.duration,
      playDate: App.autoDJTrack.playDate,
      userId: 'Auto Dj',
      showId: 'Auto Dj'
    })
    delete App.autoDJTrack
  }
}
App.autoStartError = false
App.lastTrkAcknowledged = false
App.lastTrkReceivedTime = 'useShowStart'
console.log(App.autoStartError)
console.log(App.lastTrkAcknowledged)
console.log(App.lastTrkReceivedTime)

App.sendAutoMsgs = function(msgShow, fromEmail, subjectLine, msgMsg){
	var user = Meteor.users.findOne({ _id: msgShow.userId })
	var to = ''
	var subject = subjectLine
	var message = msgMsg
	for (var i = 0; i < user.emails.length; i++){
		to = user.emails[i].address
    	Email.send({ to, fromEmail, subject, message });
	}
	
	if (msgShow.hasMessagingEnabled){
		Messages.insert({
        content: message,
        sentBy: 'KUZU App Alerts',
        showId: msgShow._id,
        producerId: msgShow.userId,
      })
	}
}
