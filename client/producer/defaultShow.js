/*Template.producerMyProgram.helpers({
  /*producerShowFields() {
    var showFields =
      'producerProfile.showName,producerProfile.defaultMeta,producerProfile.description'
    if (Meteor.user().producerProfile.isMessagingUIEnabled) {
      showFields += ',producerProfile.messagingEnabledOnShows'
    }
    return showFields
  },
})*/

Template.producerMyProgram.events({
  'click [data-edit-user-id]'(e, t) {
	var userId = $(e.currentTarget).attr('data-edit-user-id')
    Session.set('userEditingId', userId)
  },
})
