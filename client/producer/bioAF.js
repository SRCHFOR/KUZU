Template.producerMyProfileAF.onCreated(function() {
  this.autorun(() => {
    this.subscribe('oneProducer', Meteor.userId())
  })
})

Template.producerMyProfileAF.events({
  'click [data-submit-bio-edit]'(){
	Session.set('bioEditingId', false)
  },
})

Template.producerMyProfileAF.helpers({
  findBioUser() {
    return Meteor.user()
  }
})