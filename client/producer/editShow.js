import momenttz from 'moment-timezone'
Template.editShowInline.onCreated(function() {
  this.autorun(() => {
    this.subscribe('singleShow', this.data._id)
    this.subscribe('allUsersAdmin')
  })
})

Template.editShowInline.events({
  /*cancel button removed as it does nothing and is merely an illusion of the form which is automatically saved after each 
    afField is changed and renders the cancel button ineffective without extensive work into the unknown of autoform hooks
    of which a preliminary analysis has deemed this a matter of the purgatorius back-burner
  'click [data-cancel-show-edit]'() {
    Session.set('showEditingId', false)
  },*/
  'click [data-submit-show-edit]'(){
	var showStart = AutoForm.getFieldValue("showStart", "editShowInlineForm")
	var showEnd = AutoForm.getFieldValue("showEnd", "editShowInlineForm")
	if (!!showStart && !!showEnd){
		var timeshowStart = new moment(momenttz(new Date(showStart)).tz('America/Chicago')).valueOf()//new Date(showStart).getTime()
		var timeshowEnd = new moment(momenttz(new Date(showEnd)).tz('America/Chicago')).valueOf()//new Date(showEnd).getTime()
    	if(timeshowEnd <= timeshowStart){
			alert('Show End must be greater than Show Start')
		}
		else{
			Session.set('showEditingId', false)
		}
	}
	else{
		Session.set('showEditingId', false)
	}
  },
})
/*Template.editShowInline.helpers({
  show() {
    if(Meteor.user() && Meteor.user().isAdmin){
      return Shows.findOne({_id: FlowRouter.getParam('showId')});
    } else {
      return Shows.findOne({userId: Meteor.userId(), _id: FlowRouter.getParam('showId')});
    }
  }
});*/

/*AutoForm.hooks({
  editShowInlineForm: {
    onSuccess() {
      Session.set('showEditingId', false)
    },
  },
})*/
