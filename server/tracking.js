SimpleRest.setMethodOptions('getCurrentTrack', { httpMethod: 'get' })
SimpleRest.setMethodOptions('getCurrentAdditionalInfo', { httpMethod: 'get' })
SimpleRest.setMethodOptions('getCurrentAdditionalInfoHash', {
  httpMethod: 'get',
})
SimpleRest.setMethodOptions('getNicecastMeta', { httpMethod: 'get' })

Meteor.methods({
  getCurrentTrack() {
    // return 'Kuzu FM'
    var show = Shows.findOne({ isActive: true })
    if (show && show.isShowingDefaultMeta) {
      return show.defaultMeta || ' '
    }
    var track = Tracklists.findOne({}, { sort: { playDate: -1 } })
    var trackerString
    if (track.artist && track.songTitle) {
      trackerString = track.artist + ' - ' + track.songTitle
    } else if (track.songTitle) {
      trackerString = track.songTitle
    } else if (track.artistName) {
      trackerString = track.artist
    }
    return trackerString || ' '
  },
  getCurrentAdditionalInfo() {
    var show = Shows.findOne({ isActive: true })
    var ps = ProductionStatuses.findOne({ isActive: true })
    if (ps && ps.isShowingAdditionalContent) {
      return ps.additionalContent
    }
    if (show && show.isShowingDescription) return show.description
    return ' '
  },
  getNicecastMeta() {
    var artist = ''
    var trackName = ''
    var album = ''
    var show = Shows.findOne({ isActive: true })
    if (show && show.isShowingDefaultMeta) {
      artist = show.defaultMeta || ' '
    } else {
      var track = Tracklists.findOne({}, { sort: { playDate: -1 } })
      artist = track.artist
      trackName = track.songTitle
      album = track.album
    }
    return `Title: ${trackName}|Artist: ${artist}|Album: ${album}|Time: 00:00`
  },
  getCurrentAdditionalInfoHash() {
    return currentHash
  },
})

var currentHash = ''

Meteor.method(
  'insertTrack',
  function(artist, songTitle, album, label, duration) {
	App.autoStartError = false
	var activeShow = Shows.findOne({ isActive: true }) || false
	var armedShow = Shows.findOne({ isArmedForAutoStart: true })
    if (label.search(/<><>/g) !== -1) {
        label = label.replace(/<><>/g, '')
		if (!!activeShow){
			var activeShowEndSubTen = new moment(new Date(activeShow.showEnd)).subtract(10, 'minutes').valueOf()
			var currTIme = new Date().getTime()
			//If current time is greater than 10 mins prior to showEnd of active show, deactivate show and reselect for active show to see if
			//there's been a newly activated show since prior show deactivation or not.
			if (currTIme >= activeShowEndSubTen){
				Shows.update({ _id: activeShow._id }, { $set: { isActive: false, isAutoPlaying: false, autoStartEnd: false } })
				activeShow = Shows.findOne({ isActive: true }) || false
			}
		}
		App.lastTrkReceivedTime = ''
		App.lastTrkAcknowledged = false
    } 
	else {
	  if (!App.lastTrkReceivedTime){
	  	App.lastTrkReceivedTime = new moment(new Date()).valueOf()
	  }
	  else{
		App.lastTrkReceivedTime = 'useShowStart'
	  }

	  if (!!armedShow) {
		//Set some fields for proper workage
		App.lastTrkAcknowledged = true;
		Shows.update({ _id: armedShow._id },{ $set: { autoPlayPressed: false, showTrkAcknowledged: true } })
		try{
        	var result = Meteor.call('autoplayNextTrack')
  			if(!result){
				console.log('Bad result variable on autoplayNextTrack in tracking.js')
				console.log(armedShow)
				App.autoStartError = true
				let subject = 'There has been an error AutoStarting your show. Manual Start Required.'
				let message = 'There has been an error AutoStarting your show. Manual Start Required.'
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
			let subject = 'There has been an error AutoStarting your show. Manual Start Required.'
			let message = 'There has been an error AutoStarting your show. Manual Start Required.'
			App.sendAutoMsgs(armedShow, Accounts.emailTemplates.from, subject, message)
        	Shows.update(
          		{ isArmedForAutoStart: true },
				{ $set: { isArmedForAutoStart: false, autoStartEnd: false, isAutoPlaying: false, autoPlayPressed: false, startPressed: false } }
        	)
		}
      }
    }

    if (!activeShow || activeShow.hasRadioLogikTracking) {
      Tracklists.insert({
        artist: artist,
        songTitle: songTitle,
        album: album,
        label: label,
        trackLength: duration,
        playDate: new Date(),
      })
    } else {
	  App.autoDJTrack = {
        artist: artist,
        songTitle: songTitle,
        album: album,
        label: label,
        trackLength: duration,
        playDate: new Date(),
      }
    }
  },
  {
    getArgsFromRequest: function(request) {
      // Let's say we want this function to accept a form-encoded request with
      // fields named `a` and `b`.
      var content = request.body
      // Since form enconding doesn't distinguish numbers and strings, we need
      // to parse it manually
      //put to array JSON.parse(content);
      return [
        content.artist,
        content.songTitle,
        content.album,
        content.label,
        content.duration,
      ]
    },
  }
)

Meteor.method(
  'getLastTracks',
  function(numTracks) {
    numTracks = numTracks || 30
    var tracks = Tracklists.find(
      { playDate: { $exists: 1 } },
      { sort: { playDate: -1 }, limit: numTracks }
    ).fetch()
    var tracksString = ''
    _.each(tracks, function(track) {
      var trackerString = ''
      if (track.isExportable()) {
        if (track.artist && track.songTitle) {
          trackerString = track.artist + ' - ' + track.songTitle
        } else if (track.songTitle) {
          trackerString = track.songTitle
        } else if (track.artistName) {
          trackerString = track.artist
        }
        trackerString += ' (' + track.prettifyPlaydate() + ')'
      }
      tracksString += trackerString + '</br>'
    })
    return tracksString
  },
  {
    getArgsFromRequest: function(request) {
      // Let's say we want this function to accept a form-encoded request with
      // fields named `a` and `b`.
      var content = request.body
      // Since form enconding doesn't distinguish numbers and strings, we need
      // to parse it manually
      //put to array JSON.parse(content);
      return [content.numTracks]
    },
    httpMethod: 'get',
  }
)

JsonRoutes.setResponseHeaders({
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Pragma": "no-cache",
  "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
});

Meteor.startup(function() {
  Meteor.setInterval(function() {
    Meteor.call('getCurrentAdditionalInfo', function(err, res) {
      currentHash = CryptoJS.SHA1(res).toString()
    })
  }, 5000)
})
