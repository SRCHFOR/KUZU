Meteor.publish('producerShows', function(dummy) {
  //, {fields: {description: 0}}
  /*return Shows.find({
    $or: [{ userId: this.userId }, { helperUserId: this.userId }],
  })*/
  const idsA = Shows.find({
	  $and: [{
	  	//bring in only shows where startPressed exists and is false.
		startPressed: { $exists: true }}, {startPressed: false},{
      	$or: [{showStart: { $exists: false } }, { showEnd: { $exists: false } }]},{
      	$or: [{ userId: this.userId }, { helperUserId: this.userId }]
      }]
    }).map(d => d._id)

  const idsB = Shows.find({
	$and: [{
        $or:[{
			//bring in shows where startPressed doesn't exist.
			startPressed: { $exists: false }},{
			//bring in shows where startPressed exists and both showStart and showEnd exist.
        	$and:[{startPressed: { $exists: true }}, {showStart: { $exists: true }}, {showEnd: { $exists: true }}]},{
			//bring in shows where startPressed exists and is true but showStart or showEnd doesn't exist
			$and: [{
				startPressed: { $exists: true }}, {startPressed: true},{
				$or: [{showStart: { $exists: false }}, {showEnd: { $exists: false }}]
			}]
        }]},{
        $or: [{ userId: this.userId }, { helperUserId: this.userId }]
      }]
    },
    {
		limit: 26,
		sort: { showStart: -1 } 
	}).map(d => d._id)
	
  //create a third cursor to dump all ids so that when a new doc is created the subscription is ran again
  //that's all this is for, otherwise reactivity breaks on client if there's nothing to retrigger when a new doc is created on the client
  /*const lookOutCursor = Shows.find(
    {$or: [{ userId: this.userId }, { helperUserId: this.userId }]},
    { fields: { _id: 1 } }
  )*/

  //return main sub docs with lookOut._id's
  //return [Shows.find({ _id: { $in: idsA.concat(idsB) } }), lookOutCursor]
	
  return Shows.find({ _id: { $in: idsA.concat(idsB) } })
})


Meteor.publish('allUserTracks', function() {
	return Tracklists.find({ userId: this.userId })
})
