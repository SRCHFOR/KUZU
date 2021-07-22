FeatureRequests = new Mongo.Collection('featureRequests')

FeatureRequests.helpers({
  currentUserHasVotedUp() {
	var findRequestUp = FeatureRequests.findOne({
      _id: this._id,
      userVotesUp: Meteor.userId(),
    })
    if (!!findRequestUp){
		return true
    }
    else{
    	return false
	}
  },
  currentUserHasVotedDown() {
	var findRequestDown = FeatureRequests.findOne({
      _id: this._id,
      userVotesDown: Meteor.userId(),
    })
    if (!!findRequestDown){
		return true
    }
    else{
    	return false
	}
  },
})

FeatureRequests.allow({
  insert: (userId, doc) => {
    return !!userId
  },
  update: (userId, doc) => {
    return !!userId
  },
})

FeatureRequests.attachSchema({
  name: {
    type: String,
    label: 'Feature Name',
  },
  description: {
    type: String,
    label: 'Description',
  },
  userVotesUp: {
    type: [String],
    label: 'User Votes Up',
    optional: true,
  },
  userVotesDown: {
    type: [String],
    label: 'User Votes Down',
    optional: true,
  },
  userId: {
    type: String,
    autoValue() {
      if (this.isInsert) {
        return this.userId
      }
    },
  },
  totalScore: {
    type: Number,
    defaultValue: 0,
  },
})

FeatureRequests.after.update(function(
  userId,
  doc,
  fieldNames,
  modifier,
  options
) {
  if (modifier.$push || modifier.$pull) {
    var upVotes = doc.userVotesUp ? doc.userVotesUp.length : 0
    var downVotes = doc.userVotesDown ? doc.userVotesDown.length : 0
    var total = upVotes - downVotes
    FeatureRequests.update({ _id: doc._id }, { $set: { totalScore: total } })
  }
})
