var currentPlayingSongVar = new ReactiveVar(false)
var currentPlayingArtistVar = new ReactiveVar(false)
var currentPlayingSongVarTimer = ''
var currentPlayingArtistVarTimer = ''

Template.HomeLayout.onCreated(function() {
  this.subscribe('activeShowTracks')
  this.isRadioLogikDown = new ReactiveVar(false)
  setInterval(() => {
    Meteor.call('getRadioLogikStatus', (err, res) => {
      this.isRadioLogikDown.set(res)
    })
  }, 5000)
})

Template.HomeLayout.helpers({
  armedShow() {
    return Shows.findOne({ isArmedForAutoStart: true })
  },
  currentActiveShow() {
    if (Meteor.user().isAdmin) {
      return Shows.findOne({ isActive: true })
    } else {
      return Shows.findOne({ userId: Meteor.userId() }, { isActive: true })
    }
  },
  currentPlayingSong() {
	currentPlayingSongVarTimer = Meteor.setInterval(function(){
	Meteor.call('getNicecastMeta', function(error, result){
											if (!!error){
												console.log("Error on HomeLayout currentPlayingSong getNicecastMeta call")
												console.log(error)
												console.log(error.reason)
												currentPlayingSongVar.set('')
											}
											else{
												currentPlayingSongVar.set(result.split(": ")[1].split("|Artist")[0])
											}
										})
	},1000)
	return currentPlayingSongVar.get()
  },
  currentPlayingArtist() {
	currentPlayingArtistVarTimer = Meteor.setInterval(function(){
	Meteor.call('getNicecastMeta', function(error, result){
											if (!!error){
												console.log("Error on HomeLayout currentPlayingArtist getNicecastMeta call")
												console.log(error)
												console.log(error.reason)
												currentPlayingArtistVar.set('')
											}
											else{
    											currentPlayingArtistVar.set(result.split(": ")[2].split("|Album")[0])
											}
										})
	},1000)
	return currentPlayingArtistVar.get()
  },
  cancelSongArtistTimers() {
	if (!!currentPlayingSongVarTimer){
		Meteor.clearInterval(currentPlayingSongVarTimer)
		currentPlayingSongVarTimer = ''
	}
	if (!!currentPlayingArtistVarTimer){
		Meteor.clearInterval(currentPlayingArtistVarTimer)
		currentPlayingArtistVarTimer = ''
	}
  },
  isRadioLogikDown() {
    return Template.instance().isRadioLogikDown.get()
  },
})
