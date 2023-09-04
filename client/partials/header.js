var logoutReloadTimout = '';
Template.HomeLayout.onCreated(function() {
  this.autorun(() => {
	Blaze._allowJavascriptUrls();
	this.subscribe('new-messages-count-user')

	/*
	//*************************************************************************
	//                 session disconnect/reconnect
	//*************************************************************************
	let disconnectTimer = null

	// TODO update from https://github.com/mixmaxhq/meteor-smart-disconnect/blob/master/disconnect-when-backgrounded.js for Cordova

	// 60 seconds by default
	const disconnectTime = 60 * 1000

	const removeDisconnectTimeout = () => {
  		if (disconnectTimer) {
    		clearTimeout(disconnectTimer)
  		}
	}

	const createDisconnectTimeout = () => {
  		removeDisconnectTimeout()

  		disconnectTimer = setTimeout(() => {
    		Meteor.disconnect()
  		}, disconnectTime)
	}

	const disconnectIfHidden = () => {
  		removeDisconnectTimeout()

  		if (document.hidden) {
    		createDisconnectTimeout()
  		} else {
    		Meteor.reconnect()
  		}
	}

	document.addEventListener('visibilitychange', disconnectIfHidden)

	Meteor.startup(disconnectIfHidden)*/

	//console.log(`${new Date().toLocaleTimeString('en-GB')} : ${Meteor.status().status}`);
	//*************************************************************************
  })
})

Template.HomeLayout.helpers({
  currentActiveShow() {
    return Shows.findOne({ isActive: true })
  },
})

//Force refresh on logout because of infinite loop
Template._loginButtonsLoggedInDropdown.events({
    'click #login-buttons-logout': function (event) {
		Meteor.clearTimeout(logoutReloadTimout)
		logoutReloadTimeout = Meteor.setTimeout(function() {
    		location.reload();
		},2000)
	}
})