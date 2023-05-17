//import momenttz from 'moment-timezone'
Template.adminShows.helpers({
  showsIndex() {
    return ShowsIndex
  },
})

Template.adminShows.helpers({
  endTimeAfterCurrentDate() {
	var showEnd = moment(new Date(this.showEnd))
    //var showEnd = new moment(momenttz(new Date(this.showEnd)).tz('America/Chicago'))
      .add(10, 'minutes')
      .valueOf()
	var timeNow = new Date().getTime()
    //var timeNow = momenttz(new Date()).tz('America/Chicago')
    return timeNow <= showEnd
  },
})

Template.adminShows.events({
  'click [data-deactivate-show-id]'(e, t) {
    var showId = $(e.currentTarget).attr('data-deactivate-show-id')
    Meteor.call('deactivateShow', showId)
	//Client must be refreshed when a show is deactivated
	location.reload()
  },
  'click [data-activate-show-id]'(e, t) {
    var showId = $(e.currentTarget).attr('data-activate-show-id')
    Meteor.call('activateShow', showId)
    //FlowRouter.go('liveShow')
  },
  'click [data-delete-id]'(e, t) {
    if (confirm('Are You sure want to delete this?')) {
      var showId = $(e.currentTarget).attr('data-delete-id')
      Meteor.call('removeShow', showId)
    }
  },
  'click [data-delete-keep-trks-id]'(e, t) {
    if (confirm('Are You sure want to delete this?')) {
      var showId = $(e.currentTarget).attr('data-delete-keep-trks-id')
      Meteor.call('removeShowKeepTracks', showId)
    }
  },
  'click [data-duplicate-id]'(e, t) {
    var showId = $(e.currentTarget).attr('data-duplicate-id')
    var showName = prompt('Duplicate Show Name?')
    if (showName && showId) {
      Meteor.call('duplicateShow', showId, showName)
    }
  },
  'click [data-duplicate-tracks-id]'(e, t) {
    var showId = $(e.currentTarget).attr('data-duplicate-tracks-id')
    var showName = prompt('Duplicate Show Name?')
    if (showName && showId) {
      Meteor.call('duplicateShowWithTracks', showId, showName)
    }
  },
  'click [data-stop-auto-start-show-id]'(e, t) {
    var showId = $(e.currentTarget).attr('data-stop-auto-start-show-id')
    Meteor.call('removeAutoStartShow', showId)
  },
  'click [data-auto-start-show-id]'(e, t) {
    var showId = $(e.currentTarget).attr('data-auto-start-show-id')
    Meteor.call('addAutoStartShow', showId, function(error, result){
  									if(error){
    									console.log(error.reason);
										console.log('Error AutoStarting Show')
										alert('There was an error on enable Auto Start. Auto Start currently disabled.')
  									}
									else{
										if(result == 1){
											alert('All tracks must be in MM:SS format and must have a track length of at least "00:01" to enable AutoStart!')
										}
										else if(result == 2){
											alert('Tracks must be loaded to the show to enable AutoStart!')
										}
									}
								})
  },
})
