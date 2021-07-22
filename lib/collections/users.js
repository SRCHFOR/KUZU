var usersArray1 = []
Meteor.startup( function (){

		  Meteor.call('getAllUserShows', function(error, result){
											if (!!error){
												console.log("error on getAllUserShows from showStartReminderSubs")
												console.log(error)
												console.log(error.reason)
											}
											else{
          										_.each(result, function(user) {
            										usersArray1.push({ label: user.producerProfile.showName, value: user._id })
          										})
											}
										})

})
Meteor.users.helpers({
  hasShow() {
    //we don't need to use arrow notation for this
    var userShow = Shows.findOne({ userId: this._id })
	if (!!userShow){
		return true
	}
	else{
		return false
	}
  },
  tracks() {
    return Tracklists.find({ userId: this._id }) //get all tracks that the user inserted the id from the user
  },
  shows() {
    return Shows.find({ userId: this._id })
  },
  canLookAtLiveShow() {
    if (
      this.isAdmin ||
      Shows.findOne({
        $or: [{ userId: this._id }, { helperUserId: this._id }],
        isActive: true,
      })
    ) {
      return true
    }
  },
  messages() {
    return Messages.find({ producerId: this._id }, { sort: { sentAt: 1 } })
  },
  unreadMessagesCount() {
    return Counts.get('new-messages-count-user')
  },
})

Meteor.users.allow({
  update: (userId, doc) => {
    return !!userId
  },
})

//we need to put user schema here, look at simple schema docs on how to add schema to user
//this should be name, image (which will be autoform file), and bio (which should be summernote)

var userProfile = new SimpleSchema({
  name: {
    type: String,
    label: 'Name',
    optional: true,
  },
})

var producerProfile = new SimpleSchema({
  name: {
    type: String,
    label: 'Producer name',
    optional: true,
  },
  bio: {
    type: String,
    label: 'Producer Bio',
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
  isPioneer: {
    type: Boolean,
    label: 'Is this producer a pioneer',
    defaultValue: false,
  },
})

var producerShow = new SimpleSchema({
  showName: {
    type: String,
    label: 'Defaul Show Name',
    optional: true,
  },
  defaultMeta: {
    type: String,
    label:
      "Default Show Meta Data (When you don't want song title and artist name on media player)",
    optional: true,
  },
  description: {
    type: String,
    label: 'Default Show Description',
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
  isAutomationUIEnabled: {
    type: Boolean,
    label: 'Enable automation tools',
    defaultValue: false,
  },
  isMessagingUIEnabled: {
    type: Boolean,
    label: 'Enable messaging tools',
    defaultValue: false,
  },
  messagingEnabledOnShows: {
    type: Boolean,
    label: 'Is messaging enabled by default on new shows',
    defaultValue: false,
  },
  isShowStartReminderEnabled: {
    type: Boolean,
    label: 'Enable show start reminder subscriptions',
    defaultValue: false,
  },
  showStartReminderSubs: {
    type: [String],
    label: 'Show Reminder Subscriptions: CTRL/CMD-Click for multi-select & to deselect',
    autoform: {
      type: 'select-multiple',
      afFieldInput: {
		options() {
		  //usersArray1 must be assigned by the autostart function at the top of this file because of the reactivity of the autoform that
		  //cause the afFieldInput options function to be ran several times and ultimately wipes the array if created in this options function
		  return usersArray1
        },
      },
    },
    optional: true,
  },
})

var producerInformation = new SimpleSchema([producerProfile, producerShow])

Meteor.users.attachSchema({
  isProducer: {
    type: Boolean,
    defaultValue: false,
    optional: true,
  },
  isAdmin: {
    type: Boolean,
    optional: true,
  },
  username: {
    type: String,
    optional: true,
  },
  emails: {
    type: Array,
    optional: true,
  },
  'emails.$': {
    type: Object,
  },
  'emails.$.address': {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
  },
  'emails.$.verified': {
    type: Boolean,
  },
  registered_emails: {
    type: Array,
    optional: true,
  },
  'registered_emails.$': {
    type: Object,
    blackbox: true,
  },
  createdAt: {
    type: Date,
  },
  profile: {
    type: userProfile,
    optional: true,
  },
  producerProfile: {
    type: producerInformation,
    optional: true,
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  roles: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  roles: {
    type: Array,
    optional: true,
  },
  'roles.$': {
    type: String,
  },
  heartbeat: {
    type: Date,
    optional: true,
  },
})

Meteor.users.before.update(function(
  userId,
  doc,
  fieldNames,
  modifier,
  options
) {
  if (
    Meteor.isServer &&
    modifier.$set &&
    modifier.$set['producerProfile.bio']
  ) {
    modifier.$set['producerProfile.bio'] = modifier.$set[
      'producerProfile.bio'
    ].replace(/\\n/g, '')
  }
  if (
    Meteor.isServer &&
    modifier.$set &&
    modifier.$set['producerProfile.description']
  ) {
    modifier.$set['producerProfile.description'] = modifier.$set[
      'producerProfile.description'
    ].replace(/\\n/g, '')
  }
})

Meteor.users.after.update(function (userId, doc, fieldNames, modifier, options) {
  if (Meteor.isServer && !!modifier.$set && modifier.$set['emails.$.verified']) {
	Meteor.call('updateisProducer', doc._id)
  }
});
