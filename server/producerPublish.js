Meteor.publish('producerShows', function() {
  //, {fields: {description: 0}}
  return Shows.find({
    $or: [{ userId: this.userId }, { helperUserId: this.userId }],
  })
})


Meteor.publish('allUserTracks', function() {
	return Tracklists.find({ userId: this.userId })
})
