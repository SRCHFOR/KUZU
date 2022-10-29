Template.producerMyProfile.events({
  'click [data-edit-bio-id]'(e, t) {
	var bioId = $(e.currentTarget).attr('data-edit-bio-id')
    Session.set('bioEditingId', bioId)
  },
})