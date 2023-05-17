//import momenttz from 'moment-timezone'
Template.showTracks.onCreated(function() {
  Template.instance().uploading = new ReactiveVar(false)
  this.autorun(() => {
    this.subscribe('singleShow', FlowRouter.getParam('showId'))
    this.subscribe('showTracks', FlowRouter.getParam('showId'))
  })
})

Template.showTracks.helpers({
  uploading() {
    return Template.instance().uploading.get()
  },
  numOfTracks(){
	return Tracklists.find({ showId: FlowRouter.getParam('showId') }).count()
  },
  showStarted(){
	return Shows.findOne({userId: Meteor.userId(),_id: FlowRouter.getParam('showId'),}).startPressed
  },
  trackPlayed(trackId){
	var playDate = Tracklists.findOne({ _id: trackId }).playDate
	//var playDate = momenttz(new Date(Tracklists.findOne({ _id: trackId }).playDate)).tz('America/Chicago')
	return playDate
  },
  showMain() {
    if (Meteor.user() && Meteor.user().isAdmin) {
      return Shows.findOne({ _id: FlowRouter.getParam('showId') })
    } else {
      return Shows.findOne({
        userId: Meteor.userId(),
        _id: FlowRouter.getParam('showId'),
      })
    }
  },
})

Template.showTracks.events({
  'click [data-download-csv]': function(event) {
    var show = Shows.findOne({ _id: FlowRouter.getParam('showId') })
    var nameFile = show.showName + '_tracks.tsv'
    Meteor.call('downloadShowTracks', FlowRouter.getParam('showId'), function(
      error,
      fileContent
    ) {
      if (fileContent) {
        var blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' })
        saveAs(blob, nameFile)
      }
    })
  },
  'click [data-remove-track]'(e, t) {
    var trackId = $(e.currentTarget).attr('data-remove-track')
    Meteor.call('removeTrack', trackId)
  },
  'click [data-move-up]'(e, t) {
    var trackId = $(e.currentTarget).attr('data-move-up')
    Meteor.call('decrementPosition', trackId)
  },
  'click [data-move-down]'(e, t) {
    var trackId = $(e.currentTarget).attr('data-move-down')
    Meteor.call('incrementPosition', trackId)
  },
  'click [data-get-track-playtimes]'() {
    $('#trackPlaytimesModal').modal()
  },
  'change [name="uploadCSV"]'(event, template) {
    template.uploading.set(true)

    Papa.parse(event.target.files[0], {
      header: true,
      complete(results, file) {
        Meteor.call(
          'reaperParseUpload',
          FlowRouter.getParam('showId'),
          results.data,
          (error, response) => {
            if (error) {
              console.log(error.reason)
            } else {
              template.uploading.set(false)
              alert('Upload complete!', 'success', 'growl-top-right')
            }
          }
        )
      },
    })
  },
  'click [data-remove-all-tracks]'(event, template) {
	if (confirm('Are you sure you want to Remove All Tracks?')){
    	Meteor.call('removeAllTracks', FlowRouter.getParam('showId'))
	}
  },
})
