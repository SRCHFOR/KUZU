Meteor.startup(function() {
  Meteor.setInterval(function() {
    //var response = HTTP.get(apiUrl).data
	App.getListeners()
  }, 300000) //every 5 minutes
})

Meteor.methods({
  getListenerHours(startDate, endDate) {
    var listeningHours = 0
    var listenerStatsArray = ListenerStats.find({
      fetchDate: { $gte: startDate, $lt: endDate },
    }).fetch()
    _.each(listenerStatsArray, function(listenerStat) {
      listeningHours += (5 / 60) * listenerStat.numListeners
    })
    return listeningHours
  },
})
