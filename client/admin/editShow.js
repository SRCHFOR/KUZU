import momenttz from 'moment-timezone'
Template.editShow.onCreated(function() {
  this.showId = FlowRouter.getParam('showId')
  this.autorun(() => {
    this.subscribe('singleShow', this.showId)
    this.subscribe('allUsersAdmin')
  })
})

Template.editShow.events({
  'click [data-submit-show-edit]'(){
	var showStart = AutoForm.getFieldValue("showStart", "editShowForm")
	var showEnd = AutoForm.getFieldValue("showEnd", "editShowForm")
	if (!!showStart && !!showEnd){
		var timeshowStart = new moment(momenttz(new Date(showStart)).tz('America/Chicago')).valueOf()//new Date(showStart).getTime()
		var timeshowEnd = new moment(momenttz(new Date(showEnd)).tz('America/Chicago')).valueOf()//new Date(showEnd).getTime()
    	if(timeshowEnd <= timeshowStart){
			alert('Show End must be greater than Show Start')
		}
		else{
			window.history.back()
		}
	}
	else{
		window.history.back()
	}
  },
})

Template.editShow.helpers({
  showUserCheck() {
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

/*
Disabled hook because submit event is controlling window back
AutoForm.hooks({
  editShowForm: {
    onSuccess() {
      window.history.back()
    },
  },
})
*/
