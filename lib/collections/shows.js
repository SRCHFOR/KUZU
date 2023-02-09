import { Index, MongoTextIndexEngine, MongoDBEngine } from 'meteor/easy:search'
import momenttz from 'moment-timezone'
Shows = new Mongo.Collection('shows')

Shows.allow({
  insert: function(userId, doc) {
    return !!userId
  },
  update: (userId, doc) => {
    return !!userId
  },
})

ShowsIndex = new Index({
  collection: Shows,
  fields: ['showName'],
  engine: new MongoDBEngine({
    selector(searchDefinition, options, aggregation) {
      const selector = this.defaultConfiguration().selector(
        searchDefinition,
        options,
        aggregation
      )
      var user = Meteor.users.findOne({ _id: options.search.userId })
      if (!user && (user && !user.isAdmin)) {
        selector.userId = false
        return selector
      }
      /*if(user.isAdmin) {
        //selector["$or"] = [{userId: options.search.userId}, {helperUserId: options.search.userId}];
      }*/
      return selector
    },
    sort: function(searchObject, options) {
      return { showStart: -1 }
    },
    fields(searchObject, options) {
      return { description: 0 }
    },
  }),
})

Shows.helpers({
  user() {
    return Meteor.users.findOne({ _id: this.userId })
  },
  showTracks() {
    return Tracklists.find({ showId: this._id }, { sort: { indexNumber: 1 } })
  },
  showTracksDate() {
    return Tracklists.find({ showId: this._id }, { sort: { playDate: 1 } })
  },
  recentlyPlayedSongs() {
    return Tracklists.find(
      { showId: this._id, isHighlighted: true },
      { sort: { playDate: 1 } }
    )
  },
  currentPlayingTracklist() {
	var track = Tracklists.findOne(
      { showId: this._id },
      { sort: { playDate: -1 }, limit: 1 }
    )
    return track
  },
  getHighestTrackNumber() {
    var track = Tracklists.findOne(
      { showId: this._id },
      { sort: { indexNumber: -1 } }
    )
    if (track) {
      return track.indexNumber
    } else {
      return -1
    }
  },
  hasNextTrack() {
    var show = Shows.findOne({ isActive: true })
    if (!!show){
		var showId = show._id
    	var nextTrack = Tracklists.findOne(
      		{ showId: showId, playDate: { $exists: false } },
      		{ sort: { indexNumber: 1 }, limit: 1 }
    	)
		if (!!nextTrack){
	  		return true
		}
	}
    return false
  },
  currentUserOwnsShow() {
    return this.userId == Meteor.userId()
  },
  startTimeAfterCurrentDate() {
    var showStart = new moment(momenttz(new Date(this.showStart)).tz('America/Chicago'))// new moment(new Date(this.showStart))
      .add(10, 'minutes')
      .valueOf()
    var timeNow = momenttz(new Date()).tz('America/Chicago')//new Date().getTime()
    return timeNow <= showStart
  },
  tenMinutesPriorToShowTime() {
   if(!!this.showStart){
    var showStart = momenttz(new Date(this.showStart)).tz('America/Chicago')//this.showStart.getTime()
    var timeNowPlusTen = new moment(momenttz(new Date()).tz('America/Chicago')/*new Date()*/)
      .add(10, 'minutes')
      .valueOf()
    return timeNowPlusTen >= showStart
   }
   else{
	return false
   }
  },
  endTimeAfterCurrentDate() {
    var showEnd = new moment(momenttz(new Date(this.showEnd)).tz('America/Chicago'))// new moment(new Date(this.showEnd))
      .add(10, 'minutes')
      .valueOf()
    var timeNow = momenttz(new Date()).tz('America/Chicago')//new Date().getTime()
    return timeNow <= showEnd
  },
  messages() {
    return Messages.find({ showId: this._id })
  },
  checkStartPressed(showId){
	var show = Shows.findOne({ _id: showId, startPressed: { $exists: true } })
	var startPressed = false
	//add startPressed field to shows before startPressed was added to schema
	if (!show){
		var show = Shows.findOne({ _id: showId, showStart: { $exists: true } })
		if (!!show){
			var showStart = momenttz(new Date(show.showStart)).tz('America/Chicago')//show.showStart.getTime()
    		var timeNow = momenttz(new Date()).tz('America/Chicago')//new Date().getTime()
			if (timeNow >= showStart){
				Shows.update(
      				{ _id: showId },
      				{ $set: { startPressed: true } }
    			)
				startPressed = true
			}
			else{
				Shows.update(
      				{ _id: showId },
      				{ $set: { startPressed: false } }
    			)
			}
		}
	}
	else{
		startPressed = show.startPressed
	}
	return startPressed
  },
  showStartExists(showId){
	var show = Shows.findOne({ _id: showId, showStart: { $exists: true } })
	return !!show
  },
})

Shows.attachSchema({
  showName: {
    type: String,
    label: 'Show Name',
  },
  showStart: {
    type: Date,
    autoform: {
      type: 'bootstrap-datetimepicker',
    },
    optional: true,
  },
  showEnd: {
    type: Date,
    autoform: {
      type: 'bootstrap-datetimepicker',
    },
    optional: true,
  },
  autoStartEnd: {
    type: Boolean,
    label: 'Autostart and end show?',
    defaultValue: false,
  },
  isArmedForAutoStart: {
    type: Boolean,
    label: 'Is show armed for autostart',
    defaultValue: false,
  },
  defaultMeta: {
    type: String,
    label:
      "Default Show Meta Data (When you don't want song title and artist name on media player)",
  },
  isShowingDefaultMeta: {
    type: Boolean,
    label: 'Show this default data on media player',
    defaultValue: false,
  },
  userId: {
    type: String,
    autoValue() {
      if (this.isInsert) {
        return this.userId
      }
    },
    autoform: {
      afFieldInput: {
        options() {
          var users = Meteor.users.find().fetch()
          var usersArray = []
          _.each(users, function(user) {
            usersArray.push({ label: user.emails[0].address, value: user._id })
          })
          return usersArray
        },
      },
    },
  },
  isActive: {
    type: Boolean,
    optional: true,
  },
  startPressed: {
	type: Boolean,
    defaultValue: false,
  },
  autoPlayPressed:{
	type: Boolean,
    defaultValue: false,
  },
  showTrkAcknowledged:{
	type: Boolean,
    defaultValue: false,
  },
  startMsgSent:{
	type: Boolean,
    defaultValue: false,
  },
  description: {
    type: String,
    label: 'Description',
    autoform: {
      afFieldInput: {
        type: 'summernote',
        settings: {
		  callbacks: {
			onPaste: function(e) {
			  // using timeout callback so the picture has long enough to register on page and can be scrubbed completely.
			  setTimeout(function(){
			  alert('You must use an HTML link to your picture.')
			  var imglength = $('#summernote').summernote('code').context.images.length;
			  if(imglength >= 1){
				var img = $('#summernote').summernote('code').context.images
			  
				for(var i = 0; i < imglength; i++){
					// always use img[0] and not img[i] because the object is activily reworked to where the current image is always img[0]
					// var i is just used to count up to imglength
					if(img[0].outerHTML == '<img>'){
						img[0].outerHTML = ''
					}
					else if(img[0].outerHTML.search('data:image') >= 0){
						img[0].outerHTML = '<p>Your image has been removed</p>'
					}
				}
			  }
			  },4)
    		},
			onImageUpload: function(files) {
			  //console.log('imgupload')
			  //console.log($('#summernote').summernote('code'))
	
			  // using timeout callback so the picture has long enough to register on page and can be scrubbed completely.
			  setTimeout(function(){
			  alert('You must use an HTML link to your picture.')
			  var imglength = $('#summernote').summernote('code').context.images.length;
			  if(imglength >= 1){
				var img = $('#summernote').summernote('code').context.images
			  
				for(var i = 0; i < imglength; i++){
					// always use img[0] and not img[i] because the object is activily reworked to where the current image is always img[0]
					// var i is just used to count up to imglength
					if(img[0].outerHTML == '<img>'){
						img[0].outerHTML = ''
					}
					else if(img[0].outerHTML.search('data:image') >= 0){
						img[0].outerHTML = '<p>Your image has been removed</p>'
					}
				}
			  }
			  },4)
	
    	    },
    	  },
		},
      },
    },
    optional: true,
  },
  isShowingDescription: {
    type: Boolean,
    label: 'is the description showing',
    defaultValue: true,
  },
  isAutoPlaying: {
    type: Boolean,
    label: 'Does this show autoplay?',
    defaultValue: false,
  },
  hasRadioLogikTracking: {
    type: Boolean,
    label: 'Does tracking information come from radio logik?',
    defaultValue: false,
  },
  helperUserId: {
    type: [String],
    label: 'Helper User: CTRL/CMD-Click for multi-select & to deselect',
    autoform: {
      type: 'select-multiple',
      afFieldInput: {
        options() {
          var users = Meteor.users.find().fetch()
          var usersArray = []
          _.each(users, function(user) {
            usersArray.push({ label: user.emails[0].address, value: user._id })
          })
          return usersArray
        },
      },
    },
    optional: true,
  },
  numTracks: {
    type: Number,
    label: 'Number of tracks',
    defaultValue: 0,
  },
  hasMessagingEnabled: {
    type: Boolean,
    label: 'Is messaging enabled for this show',
    defaultValue: false,
  },
})

Shows.before.update(function(userId, doc, fieldNames, modifier, options) {
  if (Meteor.isServer && modifier.$set && modifier.$set.description) {
    modifier.$set.description = modifier.$set.description.replace(/\\n/g, '')
  }
})

//Believed invalid code left from an unimplemented feature as evident by the AutoEnd_ being found only in this method out of the whole program
/*Shows.after.update(function(userId, doc, fieldNames, modifier, options) {
  if (
    Meteor.isServer &&
    doc.autoStartEnd &&
    modifier.$set &&
    (modifier.$set.showStart || modifier.$set.showEnd)
  ) {
    SyncedCron.remove('AutoStart_' + doc._id)
    SyncedCron.remove('AutoEnd_' + doc._id)
    App.addAutoStartShow(doc._id)
  }
})*/
