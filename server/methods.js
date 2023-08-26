import momenttz from 'moment-timezone'
Meteor.methods({
  download: function(dateFrom = false, dateTo = false) {
    var collection = ''
    if (dateFrom) {
      collection = Tracklists.find({
        playDate: { $gte: dateFrom, $lt: dateTo },
      }).fetch()
    } else {
      collection = Tracklists.find().fetch()
    }
    var heading = true
    var delimiter = ';'
    return exportcsv.exportToCSV(collection, heading, delimiter)
  },
  downloadShowTracks: function(showId) {
    collection = Tracklists.find(
      { showId: showId },
      { fields: { userId: 0, showId: 0 } }
    ).fetch()
    collection.forEach(function(v) {
      delete v._id
    })
    var heading = true
    var delimiter = '\t'
    return exportcsv.exportToCSV(collection, heading, delimiter)
  },
  duplicateShow(showId, showObject) {
	var show = Shows.findOne({ _id: showId })
    Shows.insert(
      {
        showName: showObject.showName,
        defaultMeta: show.defaultMeta,
        isShowingDefaultMeta: show.isShowingDefaultMeta,
        description: show.description,
        isShowingDescription: show.isShowingDescription,
        hasMessagingEnabled: show.hasMessagingEnabled,
      },
      function(err, docInserted) {
		if (!showObject.copyTracks){return}
		if (!!err){console.log('duplicateShow .insert callback error');console.log(err);return;}
        var trackLists = Tracklists.find(
          { showId: show._id },
          { sort: { indexNumber: 1 } }
        ).fetch()
        _.each(trackLists, function(trackList) {
          Tracklists.insert({
            showId: docInserted,
            songTitle: trackList.songTitle,
            artist: trackList.artist,
            album: trackList.album,
            label: trackList.label,
            trackLength: trackList.trackLength,
          },function(err, docInserted){if(err){if(err.code == 11000){}else{console.log(err);console.log(docInserted);}}}
		  )
        })
		if (!!trackLists){
			var showId = docInserted
			var indexNum = 0
    		var trackLists = Tracklists.find(
          		{ showId: showId },
          		{ sort: { indexNumber: 1 } }
        		).fetch()
    		_.each(trackLists, function(trackList) {
          		Tracklists.update({ _id: trackList._id}, { $set: { indexNumber: indexNum++} })
        		})
		}
      }
    )
  },
})

Meteor.methods({
  getRadioLogikStatus() {
    return App.isRadioLogicDown
  },
  checkForAutoStartError(){
	return App.autoStartError
  },
  acknowledgeAutoError(){
	App.autoStartError = false
  },
  changePrivledge(userId, userRole, action) {
    var obj = {}
    obj[userRole] = !!action
    Meteor.users.update({ _id: userId }, { $set: obj })
  },
  updateProducerProfile: function(userId, name, image, bio) {
    Meteor.users.update(
      { _id: userId },
      { $set: { name: name, image: image, bio: bio, isProducer: true } }
    )
  },
  updateisProducer: function(userId) {
    Meteor.users.update(
      { _id: userId },
      { $set: { isProducer: true } }
    )

	var user = Meteor.users.findOne({ _id: userId })
	var to = 'kuzu929fm@gmail.com'
	//var to = 'put@email.here'
	var from = Accounts.emailTemplates.from
	var subject = 'A New Producer has registered.'
	var text = 'New Producer, "' + user.emails[0].address + '," has registered and verified their email on the producer app.'
	Email.send({ to, from, subject, text })
  },
  editTrack(modifier, _id) {
    Tracklists.update({ _id: _id }, modifier)
  },
  removeTrack(trackId) {
	var workTracklist = Tracklists.findOne({ _id: trackId })
    Tracklists.remove(trackId)
	if (!!workTracklist){
		var showId = workTracklist.showId
		var indexNum = 0
    	var trackLists = Tracklists.find(
          	{ showId: showId },
          	{ sort: { indexNumber: 1 } }
        	).fetch()
    	_.each(trackLists, function(trackList) {
          	Tracklists.update({ _id: trackList._id}, { $set: { indexNumber: indexNum++} })
        	})
	}
  },
  removeAllTracks(showId) {
    var trackLists = Tracklists.find(
          { showId: showId },
          { sort: { indexNumber: 1 } }
        ).fetch()
    _.each(trackLists, function(trackList) {
          Tracklists.remove(trackList._id)
        })
  },
  deactivateShow(showId) {
    Shows.update({ _id: showId }, { $set: { isActive: false, isAutoPlaying: false, autoStartEnd: false, autoPlayPressed: false } })
	//remove previous autoplay timers if any
	Meteor.call('clearAutoTimer')
    //App.fillAutoDJTrack()
  },
  incrementPosition(trackId) {
    var track = Tracklists.findOne({ _id: trackId })
    if (track.indexNumber || track.indexNumber === 0) {
      Tracklists.update(
        { showId: track.showId, indexNumber: track.indexNumber + 1 },
        { $set: { indexNumber: track.indexNumber } }
      )
      Tracklists.update({ _id: trackId }, { $inc: { indexNumber: 1 } })
    } else {
      var show = Shows.findOne({ _id: track.showId })
      Tracklists.update(
        { _id: trackId },
        { $set: { indexNumber: show.getHighestTrackNumber() + 1 } }
      )
    }
  },
  decrementPosition(trackId) {
    var track = Tracklists.findOne({ _id: trackId })
    if (track.indexNumber) {
      //console.log(track.showId, track.indexNumber);
      Tracklists.update(
        { showId: track.showId, indexNumber: track.indexNumber - 1 },
        { $set: { indexNumber: track.indexNumber } }
      )
      Tracklists.update({ _id: trackId }, { $inc: { indexNumber: -1 } })
    } else {
      Tracklists.update({ _id: trackId }, { $set: { indexNumber: 0 } })
    }
  },
  activateShow(showId) {
    Shows.update(
      { isActive: true },
      { $set: { isActive: false, isAutoPlaying: false, autoStartEnd: false } },
      { multi: true }
    )

	//check tack order
	try{
		var indexNum = 0
		var reNum = false
		var trackLists = Tracklists.find(
    		{ showId: showId },
    		{ sort: { indexNumber: 1 } }
    	).fetch()
    	_.each(trackLists, function(trackList) {
			if(('indexNumber' in trackList) && (trackList.indexNumber == indexNum)){indexNum++}else{reNum = true; return;}
    	})
		if (reNum){
			indexNum = 0
			_.each(trackLists, function(trackList) {
				Tracklists.update({ _id: trackList._id}, { $set: { indexNumber: indexNum++} })
			})
		}
	}
	catch(err){
		console.log(err)
	}
	
    Shows.update(
      { _id: showId },
      {
        $set: {
          isActive: true,
          isShowingDefaultMeta: true,
          isArmedForAutoStart: false,
		  startPressed: true,
        },
      }
    )
  },
  removeShow(showId) {
	var trackLists = Tracklists.find(
          { showId: showId },
          { sort: { indexNumber: 1 } }
        ).fetch()
    _.each(trackLists, function(trackList) {
          Tracklists.remove(trackList._id)
        })
    Shows.remove(showId)
  },
  removeShowKeepTracks(showId) {
	Shows.remove(showId)
  },
  deleteFeature(featureId) {
    FeatureRequests.remove({ _id: featureId })
  },
  createNewShow() {
    var user = Meteor.users.findOne({ _id: Meteor.userId() })
    var showName = 'Kuzu Show'
    var showDescription = ' '
    var defaultMeta = 'Kuzu Show'
    var hasMessagingEnabled = false
	if (user.producerProfile) {
      showName = user.producerProfile.showName || 'Kuzu Show'
      showDescription = user.producerProfile.description || ''
      defaultMeta = user.producerProfile.defaultMeta || 'Kuzu Show'
      hasMessagingEnabled = user.producerProfile.isMessagingUIEnabled
    }
    Shows.insert({
      userId: Meteor.userId(),
      showName: showName,
      description: showDescription,
      defaultMeta: defaultMeta,
      hasMessagingEnabled: hasMessagingEnabled,
    })
  },
  clearPlaytime(trackId) {
    Tracklists.update({ _id: trackId }, { $unset: { playDate: '' } })
  },
  serverTime(){
	var centralTime = momenttz(new Date()).tz('America/Chicago')
	return centralTime.format('l') + ', ' + centralTime.format('LTS')
	//return new moment(new Date()).valueOf()
  },
  getAllUserShows(){
	var users = Meteor.users.find().fetch()
	return users
  },
  autoStartArmedShow(armedShow){
		var subject = ''
		var message = ''
		//Set some fields for proper workage
		App.lastTrkAcknowledged = true;
		Shows.update({ _id: armedShow._id },{ $set: { autoPlayPressed: false, showTrkAcknowledged: true } })
		try{
        	var result = Meteor.call('autoplayNextTrack')
  			if(!result){
				console.log('Bad result variable on autoplayNextTrack in methods.js call')
				console.log(result)
				console.log(armedShow)
				App.autoStartError = true
				subject = 'AutoStart Error; Manual Start Required.'
				message = 'There has been an AutoStart error on your show. Manual Show Start Required.'
				App.sendAutoMsgs(armedShow, Accounts.emailTemplates.from, subject, message)
        		Shows.update(
          			{ isArmedForAutoStart: true },
					{ $set: { isArmedForAutoStart: false, autoStartEnd: false, isAutoPlaying: false, autoPlayPressed: false, startPressed: false } }
        		)
			}
			else{
				App.autoStartError = false
        		Shows.update(
          			{ isActive: true },
          			{ $set: { isActive: false, isAutoPlaying: false, autoStartEnd: false } },
          			{ multi: true }
        		)
        		Shows.update(
          			{ isArmedForAutoStart: true },
					//startPressed set after autoplayNextTrack call in autostart so that autoplayNextTrack works correctly but autostart can still simulate actual startPressed functionality later
          			{ $set: { isActive: true, isArmedForAutoStart: false, startPressed: true } }
        		)
			}
		}
		catch(error){
    		console.log(error);
			console.log('Error on autoplayNextTrack in tracking.js')
			console.log(armedShow)
			App.autoStartError = true
			subject = 'AutoStart Error; Manual Start Required.'
			message = 'There has been an AutoStart error on your show. Manual Show Start Required.'
			App.sendAutoMsgs(armedShow, Accounts.emailTemplates.from, subject, message)
        	Shows.update(
          		{ isArmedForAutoStart: true },
				{ $set: { isArmedForAutoStart: false, autoStartEnd: false, isAutoPlaying: false, autoPlayPressed: false, startPressed: false } }
        	)
		}
  }
})

Meteor.method('removeUser', function(userId) {
  if (Meteor.user().isAdmin) {
    Meteor.users.remove(userId)
  } else if (Meteor.userId() === userId) {
    Meteor.users.remove(userId)
  }
})
