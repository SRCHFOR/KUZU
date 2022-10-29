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
	var currShow = ''
    if (Meteor.user().isAdmin) {
      currShow = Shows.findOne({ isActive: true })
    } else {
      currShow = Shows.findOne({ userId: Meteor.userId() }, { isActive: true })
    }
	var currTrack = currShow.currentPlayingTracklist()
	if(!!currTrack){
		return currTrack.songTitle
	}
  },
  currentPlayingArtist() {
	var currShow = ''
    if (Meteor.user().isAdmin) {
      currShow = Shows.findOne({ isActive: true })
    } else {
      currShow = Shows.findOne({ userId: Meteor.userId() }, { isActive: true })
    }
	var currTrack = currShow.currentPlayingTracklist()
	if(!!currTrack){
		return currTrack.artist
	}
  },
  isRadioLogikDown() {
    return Template.instance().isRadioLogikDown.get()
  },
})
