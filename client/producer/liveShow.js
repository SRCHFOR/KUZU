//import momenttz from 'moment-timezone'
var date = new ReactiveVar(new Date().toLocaleString());
var checkActiveShow = new ReactiveVar(false);
var autoPlayWaiting = new ReactiveVar(false);
var activeShowIdReactive = new ReactiveVar('');
var activeShowId = '';
var clockInterval = '';
var showStartTimeout = '';
var showStartInterval = '';
const autoPlayTimeout = function(){
								if (!showStartTimeout){
									var currshowStart = Shows.findOne({ isActive: true }).showStart.getTime()
									var currTimeMin5 = new moment(new Date()).subtract(5, 'minutes').valueOf()
									//var currshowStart = new moment(momenttz(new Date(Shows.findOne({ isActive: true }).showStart)).tz('America/Chicago')).valueOf()
									//var currTimeMin5 = new moment(momenttz(new Date()).tz('America/Chicago')).subtract(5, 'minutes').valueOf()
									
									showStartTimeout = Meteor.setTimeout(function(){
										Meteor.clearInterval(showStartInterval)
										Meteor.clearTimeout(showStartTimeout)
										autoPlayWaiting.set(false)
										//console.log('timeout')
										Meteor.call('autoplayNextTrack', function(error, result){
											if(error){
												console.log(error);
												console.log(error.reason);
												console.log('Error on autoplayNextTrack')
												alert('There was an error on enable AutoPlay. You can Manually trigger autoplay by repressing Autoplay and pressing a track Start/Restart button.')
											}
											else{
												if(!result){
													console.log('Error on autoplayNextTrack result check server console')
													alert('There was an error on enable AutoPlay. You can Manually trigger autoplay by repressing Autoplay and pressing a track Start/Restart button.')
												}
												else{
													alert('Show taking an unusual amount of time to be cued from station. AutoPlay now starting using show start for base timer.')
												}
											}
										})
									},(currshowStart - currTimeMin5))
								}
}


Template.liveShow.onCreated(function() {
	clockInterval = Meteor.setInterval(function(){Meteor.call('serverTime', function(error, result){
  									if(error){
    									console.log(error.reason);
										console.log('serverTime call error from liveShows')
										console.log('using client time')
										date.set(new Date().toLocaleString())
  									}
									else{
										//date.set(result.toLocaleString())
										date.set(result)
										//var centralTime = momenttz(new Date(result)).tz('America/Chicago')
										//centralTime = centralTime.format('l') + ', ' + centralTime.format('LTS')
										//date.set(centralTime)
									}
								})}, 1000)

  this.autorun(() => {
    this.subscribe('activeShowTracks')
    this.subscribe('activeShowMessages')
    this.subscribe('new-messages-count-show')
    this.subscribe('producerShows')
  })

	//reinit fields
	if (!(Shows.findOne({ isActive: true })._id == activeShowIdReactive.get())){
		autoPlayWaiting.set(false)
		Meteor.clearInterval(showStartInterval)
		Meteor.clearTimeout(showStartTimeout)
		showStartInterval = ''
		showStartTimeout = ''
		//Meteor.call('pauseAutoplay')
		activeShowIdReactive.set(Shows.findOne({ isActive: true })._id)
	}
})

Template.liveShow.helpers({
  currentActiveShow() {
    return Shows.findOne({ isActive: true })
  },
  highlightedTracks() {
    return Tracklists.find({ isHighlighted: true })
  },
  goBack() {
	Meteor.clearInterval(clockInterval)
    //window.history.back()
    FlowRouter.go('producerShows')
	//Client must be refreshed when a show is deactivated
	//Not sure if goBack is called when show deactivated but refreshing in case
	location.reload()
  },
  messages() {
    var show = Shows.findOne({ isActive: true })
    return Messages.find({ showId: show._id }, { sort: { sentAt: -1 } })
  },
  newMessagesCount() {
    return Counts.get('new-messages-count-show')
  },
  chkautoPlayWaiting(){
	return autoPlayWaiting.get()
  },
  theTime() {
	var realTime = date.get()
	var constructDate = ''
	if(realTime.substr(1,1) == '/' && realTime.substr(3,1) == '/'){
		constructDate = realTime.substr(4,4) + '-0' + realTime.substr(0,1) + '-0' + realTime.substr(2,1)
		if (realTime.substr(11,1) == ':'){
			constructDate = constructDate + ' 0' + realTime.substr(10,7)
		}
		else{
			constructDate = constructDate + ' ' + realTime.substr(10,8)
		}
		
	}
	else if (realTime.substr(1,1) == '/' && realTime.substr(4,1) == '/'){
		constructDate = realTime.substr(5,4) + '-0' + realTime.substr(0,1) + '-' + realTime.substr(2,2)
		if (realTime.substr(12,1) == ':'){
			constructDate = constructDate + ' 0' + realTime.substr(11,7)
		}
		else{
			constructDate = constructDate + ' ' + realTime.substr(11,8)
		}
	}
	else if(realTime.substr(2,1) == '/' && realTime.substr(4,1) == '/'){
		constructDate = realTime.substr(5,4) + '-' + realTime.substr(0,2) + '-0' + realTime.substr(3,1)
		if (realTime.substr(12,1) == ':'){
			constructDate = constructDate + ' 0' + realTime.substr(11,7)
		}
		else{
			constructDate = constructDate + ' ' + realTime.substr(11,8)
		}
		
	}
	else{
		constructDate = realTime.substr(6,4) + '-' + realTime.substr(0,2) + '-' + realTime.substr(3,2)
		if (realTime.substr(13,1) == ':'){
			constructDate = constructDate + ' 0' + realTime.substr(12,7)
		}
		else{
			constructDate = constructDate + ' ' + realTime.substr(12,8)
		}
	}
	//var time = Blaze._globalHelpers['prettifyTime'].call('prettifyTime',constructDate)
	//var day = Blaze._globalHelpers['prettifyDate'].call('prettifyDate',constructDate)
	var time = moment(new Date(constructDate)).format('hh:mm:ss')
	var day = moment(new Date(constructDate)).format('MMM DD')
    return time + ' ' + day
  },
  chkActiveShowEnd() {
	checkActiveShow.set(!!Shows.findOne({ isActive: true }))
	if (checkActiveShow.get()){
		if (!!Shows.findOne({ _id: activeShowId, isActive: false })){
	  		Meteor.clearInterval(clockInterval)
    		//window.history.back()
    		FlowRouter.go('producerShows')
			//Client must be refreshed when a show is deactivated
			location.reload()
		}
		else{
			activeShowId = Shows.findOne({ isActive: true })._id
		}
	}
	else {
		if (!!Shows.findOne({ _id: activeShowId, isActive: false })){
	  		Meteor.clearInterval(clockInterval)
    		//window.history.back()
    		FlowRouter.go('producerShows')
			//Client must be refreshed when a show is deactivated
			location.reload()
		}
	}
  },
})

Template.liveShow.events({
  'click [data-delete-message]'(e, t) {
    var messageId = $(e.currentTarget).attr('data-delete-message')
    Meteor.call('removeMessage', messageId)
  },
  'click [data-stop-show]'() {
	if (confirm('Are you sure you want to stop this show?')) {
      Meteor.call('deactivateShow', Shows.findOne({ isActive: true })._id)
	  Meteor.clearInterval(clockInterval)
      //window.history.back()
      FlowRouter.go('producerShows')
	  //Client must be refreshed when a show is deactivated
	  location.reload()
    }
  },
  'click [data-recent-tracks]'(e, t) {
    $('#recentlyPlayedSongs').modal()
    $('#recentlyPlayedSongs').on('hide.bs.modal', function(e) {
      Meteor.call('clearHighlighted')
    })
  },
  'click [data-show-messages]'(e, t) {
    $('#showMessages').modal()
    $('#showMessages').on('hide.bs.modal', function(e) {
      Meteor.call('markShowMessagesRead')
    })
  },
  'click [data-move-up]'(e, t) {
    var trackId = $(e.currentTarget).attr('data-move-up')
    Meteor.call('decrementPosition', trackId)
  },
  'click [data-move-down]'(e, t) {
    var trackId = $(e.currentTarget).attr('data-move-down')
    Meteor.call('incrementPosition', trackId)
  },
  'click [data-stop-default-tracking]'() {
    var showId = Shows.findOne({ isActive: true })._id
    Meteor.call('stopDefaultTracking', showId)
  },
  'click [data-start-default-tracking]'() {
    var showId = Shows.findOne({ isActive: true })._id
    Meteor.call('startDefaultTracking', showId)
  },
  'click [data-start-track-id]'(e, t) {
	var activeShowAutoPlay = Shows.findOne({ isActive: true }).isAutoPlaying
    var trackId = $(e.currentTarget).attr('data-start-track-id')
	var trackRec = Tracklists.findOne({ _id: trackId})
	if (activeShowAutoPlay || autoPlayWaiting.get()){
		//alert('AutoPlay must be paused to use manual controls')
		if (!trackRec.trackLength || trackRec.trackLength == '00:00' || !(/^\d\d\:\d\d$/.test(trackRec.trackLength))){
			  alert('All tracks must have a track length of at least "00:01" to enable Automation tools!')
		}
		else{
			if(confirm("Are you sure you want to start autoplay from this track?")){
				Meteor.clearInterval(showStartInterval)
				Meteor.clearTimeout(showStartTimeout)
				autoPlayWaiting.set(false)
    			Meteor.call('manualAutoPlay', trackId)
			}
		}
	}
	else{
    	//window.scroll(0, 0);
    	Meteor.call('startTrack', trackId)
	}
  },
  'click [data-restart-track-id]'(e, t) {
	var activeShowAutoPlay = Shows.findOne({ isActive: true }).isAutoPlaying
	var trackId = $(e.currentTarget).attr('data-restart-track-id')
	var trackRec = Tracklists.findOne({ _id: trackId})
	if (activeShowAutoPlay || autoPlayWaiting.get()){
		//alert('AutoPlay must be paused to use manual controls')
		if (!trackRec.trackLength || trackRec.trackLength == '00:00' || !(/^\d\d\:\d\d$/.test(trackRec.trackLength))){
			  alert('All tracks must have a track length of at least "00:01" to enable Automation tools!')
		}
		else{
			if(confirm("Are you sure you want to restart autoplay from this track?")){
				Meteor.clearInterval(showStartInterval)
				Meteor.clearTimeout(showStartTimeout)
				autoPlayWaiting.set(false)
    			Meteor.call('manualAutoPlay', trackId)
			}
		}
	}
	else{
    	//window.scroll(0, 0);
    	result = window.confirm('Are you sure you want to restart the track?')
    	if (result) {
      		Meteor.call('startTrack', trackId)
    	}
	}
  },
  'click [data-show-description]'() {
    Meteor.call('toggleShowDescription', true)
  },
  'click [data-hide-description]'() {
    Meteor.call('toggleShowDescription', false)
  },
  'click [data-autoplay]'() {
	var verifyAuto = true
	var trackLists = Tracklists.find(
          { showId: Shows.findOne({ isActive: true })._id },
          { sort: { indexNumber: 1 } }
        ).fetch()
    _.each(trackLists, function(trackList) {
          if (!trackList.trackLength || trackList.trackLength == '00:00' || !(/^\d\d\:\d\d$/.test(trackList.trackLength))){
			  verifyAuto = false
			  return
		  }
        })

	if(verifyAuto){
		//********* AUTOPLAY SECTION DESCRIPTION *********
		// 1. CALL chkautoplayPressed TO SEE IF AUTOPLAY HAS ALREADY BEEN INITIATED
		//		1.1 IF ERROR OR AUTOPLAY NOT PRESSED THEN CONTINUE AUTOPLAY CHECK SEQUENCE
		//		1.2 SET AUTOPLAYWAITING TO TRUE SO PAGE WILL KNOW WE HAVE CUED AUTOPLAY
		// 2. SHOWSTARTINTERVAL SET FOR EVERY SECOND UNTIL CHECK SEQUENCE VERIFIES SHOW HAS STARTED
		//		2.1 FIRST CALL showTrkAcknowledgment TO CHECK IF <><> TRACK (PRE-SHOW TRACK) HAS BEEN RECEIVED BY THE SERVER
		//			2.1.1 showTrkAcknowledgment TOGGLES A SWITCH AND SETS A DB FIELD ON THE SHOW THAT SHOWS THE CLIENT HAS
		//				ACKNOWLEDGE RECEIPT OF THE PRE-SHOW TRACK
		//		2.2 IF PRE-SHOW TRACK RECEIVED AND ACKNOWLEDGEMENT RETURNS TRUE THEN WE CHECK WHAT THE CURRENT STATE OF THE PRE-SHOW/SHOW TRACK
		//			WORK FIELD IS
		//			2.2.1 THE PRE-SHOW/SHOW TRACK WORK FIELD WILL BE ONE OF THE THREE: 
		//				'', (CURRENT TIME OF SHOW TRACK(NON <><>/PRE-SHOW TRACK) RECEIPT), 'useShowStart'
		//				2.2.1.1 '' INDICATES THE LAST TRACK RECEIVED BY THE SERVER WAS A <><>/PRE-SHOW TRACK
		//				2.2.1.2 CURRENT TIME IS THE TIME THE LAST SHOW TRACK WAS RECEIVED BY THE SERVER
		//				2.2.1.3 'useShowStart' INIDCATES AN ERROR AND TELLS AUTOPLAY LOGIC TO USE MONGODB SHOWSTART FIELD FOR START TIME OF SHOW
		//		2.3 IF A CURRENT TIME IS RETURNED FOR THE PRE-SHOW/SHOW TRACK WORK FIELD THEN THE INTERVAL, TIMEOUT, AND AUTOPLAYWAITING
		//			 ARE CLEARED AND autoplayNextTrack CALLED TO START AUTOPLAY IF NO ERROR AND TRUE RESULT IS RETURNED.
		// 3. autoPlayTimeout() CALLED TO SET GREATER THAN 5 MIN OF MONGODB SHOWSTART TIMEOUT
		//		3.1 TIMEOUT METHOD IS CALLED UPON ANY LOGICAL ENDPOINT OF THE INTERVAL LOGIC THAT DOESN'T END IN AUTOPLAY STARTING
		//		3.2 INTERVAL, TIMEOUT, AND AUTOPLAYWAITING ARE CLEARED AND  AND autoplayNextTrack CALLED TO START AUTOPLAY IF 
		//			NO ERROR AND TRUE RESULT IS RETURNED.
		//		3.3 BROWSER ALERT SET TO INDICATE AUTOPLAY IS BEGINNING WITH MONGODB SHOWSTART TIME BECAUSE THE SERVER HAS YET TO ACKNOWLEDGE
		//			THE PRE-SHOW/SHOW TRACKS IN CORRECT ORDER AND IN TIME.
		// 4. IF chkautoplayPressed DOES NOT RETURN IN ERROR OR RESULT IS TRUE THEN IF THE RESULT IS TRUE AUTOPLAY WILL RESUME
			
		Meteor.call('chkautoplayPressed', function(error, result){
			if(!!error || !result){
				if(error){
	    			console.log(error);
	    			console.log(error.reason);
					console.log('Error on chkautoplayPressed')
  				}
		
				//var hi = 0
				
		    	//Meteor.call("startNextTrack");
		
				alert('Autoplay will start immediately after show cued from station. You can Manually trigger autoplay by pressing a track Start/Restart button. Show Restarts will need Manual triggering.')
						
				autoPlayWaiting.set(true)
					
				if (!showStartInterval){
					showStartInterval = Meteor.setInterval(function(){Meteor.call('showTrkAcknowledgment', function(error, result){
						//console.log(++hi)
		  				if(error){
		    				console.log(error);
		    				console.log(error.reason);
							console.log('Error on showTrkAcknowledgment')
							autoPlayTimeout()
		  				}
						else{
							if(result){
								Meteor.call('chkShowTrkReceived', function(error, result){
									if(error){
		    							console.log(error);
		    							console.log(error.reason);
										console.log('Error on chkShowTrkReceived')
										autoPlayTimeout()
		  							}
									else{
										if(!!result && result != 'useShowStart'){
											Meteor.clearInterval(showStartInterval)
											Meteor.clearTimeout(showStartTimeout)
											autoPlayWaiting.set(false)
											Meteor.call('autoplayNextTrack', function(error, result){
		  										if(error){
		    										console.log(error);
		    										console.log(error.reason);
													console.log('Error on chkShowTrkReceived > autoplayNextTrack')
													alert('There was an error on enable AutoPlay. You can Manually trigger autoplay by repressing Autoplay and pressing a track Start/Restart button.')
		  										}
												else{
													if(!result){
														console.log('Error on chkShowTrkReceived > autoplayNextTrack result check server console')
														alert('There was an error on enable AutoPlay. You can Manually trigger autoplay by repressing Autoplay and pressing a track Start/Restart button.')
													}
												}
											})
										}
										else{autoPlayTimeout()}
									}
								})
							}
							else{autoPlayTimeout()}
						}
					})},(1000))
				}
			}
			else{
				if(result){
					Meteor.clearInterval(showStartInterval)
					Meteor.clearTimeout(showStartTimeout)
					autoPlayWaiting.set(false)
					Meteor.call('autoplayNextTrack', function(error, result){
  						if(error){
    						console.log(error);
    						console.log(error.reason);
							console.log('Error on chkautoplayPressed > autoplayNextTrack.')
							alert('There was an error on enable AutoPlay. You can Manually trigger autoplay by repressing Autoplay and pressing a track Start/Restart button.')
  						}
						else{
							if(!result){
								console.log('Error on chkautoplayPressed > autoplayNextTrack result check server console')
								alert('There was an error on enable AutoPlay. You can Manually trigger autoplay by repressing Autoplay and pressing a track Start/Restart button.')
							}
							else{
								alert('AutoPlay Resuming.')
							}
						}
					})
				}
			}
		})
	}
	else{
    	alert('All tracks must have a track length of at least "00:01" to enable Automation tools!')
	}
  },
  'click [data-pause-autoplay]'() {
   if (confirm('Are You sure want to Pause AutoPlay?')) {
	Meteor.clearInterval(showStartInterval)
	Meteor.clearTimeout(showStartTimeout)
	autoPlayWaiting.set(false)
	showStartInterval = ''
	showStartTimeout = ''
    Meteor.call('pauseAutoplay')
   }
  },
  'click [data-clear-playtime-id]'(e, t) {
	var activeShowAutoPlay = Shows.findOne({ isActive: true }).isAutoPlaying
	if (activeShowAutoPlay){
		alert('AutoPlay must be paused to use manual controls')
	}
	else{
    	var trackId = $(e.currentTarget).attr('data-clear-playtime-id')
    	Meteor.call('clearPlaytime', trackId)
	}
  },
  'click [data-show-the-time]'() {
    FlowRouter.go('calendar')
  },
  'click [data-stop-auto-add-trk]'() {
    alert('You must Pause AutoPlay to add a new track.')
  },
  /*'click [data-manual-autoplay]'(e, t) {
	var activeShow = Shows.findOne({ isActive: true }).isAutoPlaying
	if (activeShow){
		alert('AutoPlay must be paused to use manual controls')
	}
	else{
		Meteor.clearInterval(showStartInterval)
		Meteor.clearTimeout(showStartTimeout)
		autoPlayWaiting.set(false)
    	var trackId = $(e.currentTarget).attr('data-manual-autoplay')
    	Meteor.call('manualAutoPlay', trackId)
	}
  },*/
})

AutoForm.hooks({
  insertTracklistModal: {
    before: {
      insert(doc) {
        var show = Shows.findOne({ isActive: true })
        if (show) {
          doc.showId = show._id
        }
        return doc
      },
    },
  },
})
