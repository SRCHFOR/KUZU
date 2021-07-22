Meteor.startup(function() {
  SyncedCron.stop()
  //SyncedCron.start() appears to only need be ran once, so at Meteor.startup we run SyncedCron.stop() to clear out any jobs and then run 
  //	SyncedCron.start() to start it up again and then reload any shows that were previously queued in the coming logic for shows with
  //	autoStartEnd true
  SyncedCron.start()
  var shows = Shows.find({ autoStartEnd: true }).fetch()
  _.each(shows, function(show) {
    App.addAutoStartShow(show._id)
  })
})

App.addAutoStartShow = function(showId) {
  var show = Shows.findOne({ _id: showId })
  var pastShowTime = function(){
	  //add timeout so if autostart hasn't begun by 5 mins after showStart then send error msg/email to alert user
	  //timeout set without a clear call and only uses a check for isActive
	  Meteor.setTimeout(function(){
		var show = Shows.findOne({ _id: showId })
		if(!!show && !show.isActive && !show.startPressed){
			let subject = '10 mins past show start; AutoStart yet to begin. Manual Start Required.'
			let message = "Your Show's AutoStart has yet to begin. Please logon to producer.kuzu.fm to check show status."
			App.sendAutoMsgs(show, Accounts.emailTemplates.from, subject, message)
        	Shows.update(
          		{ isArmedForAutoStart: true },
				{ $set: { isArmedForAutoStart: false, autoStartEnd: false, isAutoPlaying: false, autoPlayPressed: false, startPressed: false } }
        	)
		}
	  },(new moment(new Date(show.showStart)).add(10, 'minutes').valueOf())-(new Date().getTime()))
  }
  if (new Date(show.showStart).getTime() > new Date().getTime()) {
    var d = moment(show.showStart)
      .subtract(5, 'minutes')
      .toDate()
    if (d.getTime() < new Date().getTime()) {
      Shows.update({ _id: show._id }, { $set: { isArmedForAutoStart: true } })
	  pastShowTime()
    } else {
      SyncedCron.add({
        name: 'AutoStart_' + show._id,
        schedule: function(parser) {
          var d = moment(show.showStart)
            .subtract(5, 'minutes')
            .toDate()
          return parser
            .recur()
            .on(d)
            .fullDate()
        },
        job: function() {
          Shows.update(
            { _id: show._id },
            { $set: { isArmedForAutoStart: true } }
          )
          SyncedCron.remove('AutoStart_' + show._id)
		  pastShowTime()
        },
      })
	  //SyncedCron.start()
    }
  }
}

App.removeAutoStartShow = function(showId) {
  SyncedCron.remove('AutoStart_' + showId)
}

Meteor.methods({
  addAutoStartShow(showId) {
	var verifyAuto = true
	var trackLists = Tracklists.find(
          { showId: showId },
          { sort: { indexNumber: 1 } }
        ).fetch()
    _.each(trackLists, function(trackList) {
          if (!trackList.trackLength || trackList.trackLength == '00:00' || !(/^\d\d\:\d\d$/.test(trackList.trackLength))){
			  verifyAuto = false
			  return
		  }
        })
	if (verifyAuto){
    	App.addAutoStartShow(showId)
    	Shows.update({ _id: showId }, { $set: { autoStartEnd: true } })
	}
	return verifyAuto
  },
  removeAutoStartShow(showId) {
    App.removeAutoStartShow(showId)
    Shows.update(
      { _id: showId },
      { $set: { autoStartEnd: false, isArmedForAutoStart: false } }
    )
  },
})
