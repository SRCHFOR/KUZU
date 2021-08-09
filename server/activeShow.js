var timeoutIds = []

//vvv Seemingly Dead Code vvv
App.startNextTrack = function(track) {
	console.log('Code doesnt seem reachable')
  var show = Shows.findOne({ isActive: true })
  var nextTrack = Tracklists.findOne(
    { showId: show._id, playDate: { $exists: false } },
    { sort: { indexNumber: 1 }, limit: 1 }
  )
  if (nextTrack) {
    Meteor.call('startTrack', nextTrack._id)
  } else {
    var showOptions = { isAutoPlaying: false }
    if (show.autoStartEnd) {
      showOptions.autoStartEnd = false
      showOptions.isActive = false
      //???? This is commented out in all other uses and found to not be needed. Verify your use. >>> App.fillAutoDJTrack()
    }
    Shows.update({ isActive: true }, { $set: showOptions })
  }
}
//^^^ Seemingly Dead Code ^^^

Meteor.methods({
  startTrack(trackId) {
    var track = Tracklists.findOne({ _id: trackId })
    if (track.trackType === 'showMeta') {
      Shows.update(
        { _id: track.showId },
        { $set: { isShowingDefaultMeta: true } }
      )
    } else {
      Shows.update(
        { _id: track.showId },
        { $set: { isShowingDefaultMeta: false } }
      )
    }
    Tracklists.update(
      { _id: trackId },
      { $set: { playDate: new Date(), isHighlighted: true } }
    )
  },
  startNextTrack() {console.log('startNextTrack')},
  chkautoplayPressed(){
	var autoPlayPressed = Shows.findOne({isActive: true})
	if (!!autoPlayPressed){
		return autoPlayPressed.autoPlayPressed
	}
	return false
  },
  chkShowTrkReceived(){return App.lastTrkReceivedTime},
  showTrkAcknowledgment(){
	if(!App.lastTrkAcknowledged){
		App.lastTrkAcknowledged = true;
		Shows.update({isActive: true}, { $set: { showTrkAcknowledged: true }})
	} 
	var checkShow = Shows.findOne({isActive: true})
	if (!!checkShow){
		return checkShow.showTrkAcknowledged
	}
	return false
  },
  autoplayNextTrack() {
	var thisShow = Shows.findOne({isActive: true}) || Shows.findOne({isArmedForAutoStart: true})
	var thisShowId = thisShow._id
	Shows.update({ _id: thisShowId }, { $set: { isAutoPlaying: true } })
	
	if (!thisShow.autoPlayPressed){
		try{
			var result = Meteor.call('setAutoTimer', thisShowId, '')

			if (!result && result !== 0){
				Shows.update({ _id: thisShowId }, { $set: { isAutoPlaying: false } })
				console.log('autoplayNextTrack found no tracks to autoplay. ShowID: ' + thisShowId)
				let subject = 'AutoPlay Not Activated; No tracks found to autoplay.'
				let message = 'No tracks where calculated to play during specified show time.'
				App.sendAutoMsgs(thisShow, Accounts.emailTemplates.from, subject, message)
			}
			else{
				Meteor.call('startTrack', Tracklists.findOne({showId: thisShowId, indexNumber: result})._id)
  				Shows.update({ _id: thisShowId }, { $set: { autoPlayPressed: true } })
				//Meteor.call('startNextTrack')
			}
		}
		catch (error){
			for (var i = 0; i < timeoutIds.length; i++){
				Meteor.clearTimeout(timeoutIds[i])
			}
			timeoutIds = []
			Shows.update({ _id: thisShowId }, { $set: { isAutoPlaying: false } })
			console.log(error);
    		console.log(error.reason);
			console.log('Error Setting AutoTimer in autoplayNextTrack')
			let subject = 'AutoPlay Failure; Error setting autotimer in autoplayNextTrack.'
			let message = 'AutoPlay Failure; Error setting autotimer in autoplayNextTrack.'
			App.sendAutoMsgs(thisShow, Accounts.emailTemplates.from, subject, message)
		}
	}
	
	var autoPlayPressed = Shows.findOne({ _id: thisShowId })
	if (!!autoPlayPressed){
		return autoPlayPressed.autoPlayPressed
	}
	return false
  },
  manualAutoPlay(trackId) {
	var thisShow = Shows.findOne({isActive: true})
	var thisShowId = thisShow._id
	Shows.update({ _id: thisShowId }, { $set: { isAutoPlaying: true } })
	
	try{
		var result = Meteor.call('setAutoTimer', thisShowId, trackId)

		//result used incase setAutoTimer came back with no track to start on
		if (!result && result !== 0){
			Shows.update({ _id: thisShowId }, { $set: { isAutoPlaying: false } })
			console.log('manualAutoPlay found no tracks to autoplay. ShowID: ' + thisShowId)
			let subject = 'AutoPlay Not Activated; No tracks found to autoplay.'
			let message = 'No tracks where calculated to play during specified show time.'
			App.sendAutoMsgs(thisShow, Accounts.emailTemplates.from, subject, message)
		}
		else{
			Meteor.call('startTrack', trackId)
			if (!thisShow.autoPlayPressed){
  				Shows.update({ _id: thisShowId }, { $set: { autoPlayPressed: true } })
			}
		}
	}
	catch (error){
		for (var i = 0; i < timeoutIds.length; i++){
			Meteor.clearTimeout(timeoutIds[i])
		}
		timeoutIds = []
		Shows.update({ _id: thisShowId }, { $set: { isAutoPlaying: false } })
		console.log(error);
    	console.log(error.reason);
		console.log('Error Setting AutoTimer in manualAutoPlay')
		let subject = 'AutoPlay Failure; Error setting autotimer in manualAutoPlay.'
		let message = 'AutoPlay Failure; Error setting autotimer in manualAutoPlay.'
		App.sendAutoMsgs(thisShow, Accounts.emailTemplates.from, subject, message)
	}
	
	var isAutoPlaying = Shows.findOne({ _id: thisShowId })
	if (!!isAutoPlaying){
		return isAutoPlaying.isAutoPlaying
	}
	return false
  },
  setAutoTimer(thisShowId, trackId){
	//remove previous timers if any
	for (var i = 0; i < timeoutIds.length; i++){
		Meteor.clearTimeout(timeoutIds[i])
	}
	timeoutIds = []
	var timeoutIdsNDX = 0
	var offsetAdjusted = 0
	var trackLengthMillis = 0
	var currTime = ''
	var showStartTime = ''
	//init whichTrkToStart to '' to indicate first time through loop
	var whichTrkToStart = ''
	var showStartTimeOffset = ''
	var thisShowSnapshot = Shows.findOne({_id: thisShowId})
	//check if autoplay cue from show AutoPlay, track Manual Autoplay, or autostart. 
	//if not from Manual Autoplay (only manual sends trackId) then we need to get lastTrkReceivedTime and calculate showStartTimeOffset
	if (/*!thisShowSnapshot.isArmedForAutoStart &&*/ !trackId){
		//if bad lastTrkReceivedTime then use showStart time
		if ((App.lastTrkReceivedTime == 'useShowStart') || (!App.lastTrkReceivedTime)){
			showStartTime = thisShowSnapshot.showStart.getTime()
		}
		else{
			showStartTime = App.lastTrkReceivedTime
		}
		currTime = new moment(new Date()).valueOf()
	    showStartTimeOffset = +currTime - +showStartTime
	}
	
	if (!!trackId){
		var trackLists = Tracklists.find(
          	{ showId: thisShowId,
			  indexNumber: {$gte: Tracklists.findOne({_id: trackId}).indexNumber}},
          	{ sort: { indexNumber: 1 } }
        	).fetch()
	}
	else{
		var trackLists = Tracklists.find(
          	{ showId: thisShowId },
          	{ sort: { indexNumber: 1 } }
        	).fetch()
	}
    _.each(trackLists, function(trackList) {

	  //Build out all timers for whole show to run regardless of isAutoPlaying so it can be turned on and off without interruption
      var splitIndex = trackList.trackLength.indexOf(':')
      var min = trackList.trackLength.substr(0, splitIndex) || 0
      var sec =
        trackList.trackLength.substr(splitIndex + 1, trackList.trackLength.length) || 0
	  trackLengthMillis = ((+min * 60 + +sec) * 1000) + trackLengthMillis

	  //subtract the lastTrkReceivedTime calculated offset from trackLengthMillis
	  if (!!trackId/*thisShowSnapshot.isArmedForAutoStart*/){
	  	offsetAdjusted = trackLengthMillis
	  }
	  else{
		offsetAdjusted = trackLengthMillis - showStartTimeOffset
	  }

	  if (offsetAdjusted > 0){
		
		if (whichTrkToStart === ''){whichTrkToStart = timeoutIdsNDX}
		
        timeoutIds[timeoutIdsNDX] = Meteor.setTimeout(function() {
          var nextTrack = Tracklists.findOne({
            showId: trackList.showId,
            indexNumber: trackList.indexNumber + 1,
          })
		  //Get snapshot again before working on show data as it may have changed
		  var thisShowSnapshot = Shows.findOne({_id: thisShowId})
          if (!!thisShowSnapshot && thisShowSnapshot.isActive && thisShowSnapshot.isAutoPlaying && !!nextTrack) {
			try{
            	Meteor.call('startTrack', nextTrack._id)
			}
			catch(error){
				console.log(error);
				console.log(error.reason);
				console.log('Error on startTrack in setAutoTimer track timeout. Track._id: "'+nextTrack._id+'"')
				let subject = 'Error during AutoPlay. Track "'+nextTrack.songTitle+'" not started during AutoPlay. AutoPlay will continue.'
				let message = 'Track "'+nextTrack.songTitle+'" not started during AutoPlay. AutoPlay will continue.'
				App.sendAutoMsgs(thisShowSnapshot, Accounts.emailTemplates.from, subject, message)
			}
          } 
		  else {
		  	var showOptions = {isAutoPlaying: false, autoStartEnd: false}
			if(!!nextTrack){
				try{
          			Shows.update({ _id: thisShowSnapshot._id }, { $set: showOptions })
				}
				catch(error){
					console.log('thisShowSnapshot is undefined in activeShow line 239')
				}
            }
			else{
            	console.log('there is no next track!')
				//Deactivate show if autoplay is enabled
				if (!!thisShowSnapshot && thisShowSnapshot.isActive && thisShowSnapshot.isAutoPlaying){
              		showOptions.isActive = false
				}
          		try{
          			Shows.update({ _id: thisShowSnapshot._id }, { $set: showOptions })
				}
				catch(error){
					console.log('thisShowSnapshot is undefined in activeShow line 252')
				}
              	//App.fillAutoDJTrack()
            }
          }
        }, offsetAdjusted)
	  }
	  timeoutIdsNDX++
	})
	return whichTrkToStart
  },
  pauseAutoplay() {
    Shows.update({ isActive: true }, { $set: { isAutoPlaying: false } })
  },
  stopDefaultTracking(showId) {
    Shows.update({ _id: showId }, { $set: { isShowingDefaultMeta: false } })
  },
  startDefaultTracking(showId) {
    Shows.update({ _id: showId }, { $set: { isShowingDefaultMeta: true } })
  },
  toggleShowDescription(isShowing) {
    Shows.update(
      { isActive: true },
      { $set: { isShowingDescription: isShowing } }
    )
  },
  clearHighlighted() {
    Tracklists.update(
      { isHighlighted: true },
      { $set: { isHighlighted: false } },
      { multi: true }
    )
  },
})
