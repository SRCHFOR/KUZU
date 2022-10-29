Template.producerMyProgramAF.onCreated(function() {
  this.autorun(() => {
    this.subscribe('oneProducer', Meteor.userId())
  })
})

Template.producerMyProgramAF.events({
  'click [data-submit-user-edit]'(){
	Session.set('userEditingId', false)
  },
})

Template.producerMyProgramAF.helpers({
  findUser() {
    return Meteor.user()
  }
})