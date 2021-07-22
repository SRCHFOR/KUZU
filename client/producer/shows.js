var showsDateSwitch = new ReactiveVar(false);
var checkAutoStartError = new ReactiveVar(false);
var checkArmedShow = new ReactiveVar(false);
var autoErrorCheckInterval = '';
var armedShowId = '';

Template.producerShows.helpers({
  hasFullUI() {
    return (
      this.helperUserId !== Meteor.userId() ||
      Meteor.user().isAdmin ||
      this.userId === Meteor.userId()
    )
  },
  showsWithDates() {
    return Shows.find(
      {
        showStart: { $exists: true } , showEnd: { $exists: true },
        $or: [{ userId: Meteor.userId() }, { helperUserId: Meteor.userId() }],
      },
      { sort: { showStart: -1 } }
    )
  },
  showsWithoutDates() {
    return Shows.find({
	  $and: [{
      $or: [{showStart: { $exists: false } }, { showEnd: { $exists: false } }]},{
      $or: [{ userId: Meteor.userId() }, { helperUserId: Meteor.userId() }]
      }]
    })
  },
  updateShowFormId() {
    return 'updateShow' + this._id
  },
  showDuplicateModal(){
	$('#alertmodal').one('shown.bs.modal', function() { 
		$(this).find('p[id="alerttxt"]').html('A Show Name must be entered to duplicate.')
		
		//enter press
		$(this).keypress(function(e){
    		if(e.which == 13) {
				$('#alertmodal').modal("hide")
    		}
  		})
  		$(this).find('button[id="alertBtnCan"]').click(function() {
        	$('#alertmodal').modal("hide")
   		})
		$(this).find('button[id="alertBtnX"]').click(function() {
        	$('#alertmodal').modal("hide")
   		})
	})
	$('#duplicateShowModal').one('shown.bs.modal', function() { 
    	var that = $(this);
		$(this).find('input[id="copyTracks"]').val('on')
		$(this).find('input[id="copyTracks"]').prop('checked', true)
		$(this).find('input[id="showName"]').val('')
		$.data(duplicateShowModal,"weOK",false)
		
		$(this).find('input[id="copyTracks"]').click(function() {
    		that.find('input[id="copyTracks"]').val() == 'off' ? that.find('input[id="copyTracks"]').val('on') : that.find('input[id="copyTracks"]').val('off')
		})
    	$(this).find('button[id="copyTracksBtnYes"]').click(function() {
			if (!that.find('input[id="showName"]').val()){
				$('#alertmodal').modal()
			}
			else{
				$.data(duplicateShowModal,"weOK",true)
				$('#duplicateShowModal').modal("hide")
			}
   		})
		//enter press
		$(this).keypress(function(e){
    		if(e.which == 13) {
				if (!that.find('input[id="showName"]').val()){
					$('#alertmodal').modal()
				}
				else{
					$.data(duplicateShowModal,"weOK",true)
					$('#duplicateShowModal').modal("hide")
				}
    		}
  		})
  		$(this).find('button[id="copyTracksBtnCan"]').click(function() {
        	$('#duplicateShowModal').modal("hide")
   		})
		$(this).find('button[id="copyTracksBtnX"]').click(function() {
        	$('#duplicateShowModal').modal("hide")
   		})
	})
  },
  isTenMinutesPriorToShowTime(showId) {
	var thisShow = Shows.findOne({_id: showId})
	showsDateSwitch.set(thisShow.tenMinutesPriorToShowTime())
	if (!showsDateSwitch.get()){
      var dateSwitchIntervale = Meteor.setInterval(function(){if (!showsDateSwitch.get()){showsDateSwitch.set(thisShow.tenMinutesPriorToShowTime())}else{Meteor.clearInterval(dateSwitchIntervale)}}, 1000)
    }
    return showsDateSwitch.get()
  },
  warnBadAutoStart() {
	autoErrorCheckInterval = Meteor.setInterval(function(){Meteor.call('checkForAutoStartError', function(error, result){
  									if(error){
    									console.log(error.reason);
										console.log('Error checking failed for Autostart checkForAutoStartError')
  									}
									else{
										if(result){
											alert('There was an error on enable Auto Start. Manual Start Required.')
											checkAutoStartError.set(result)
											Meteor.call('acknowledgeAutoError')
										}
										else{
											if (checkAutoStartError.get()){checkAutoStartError.set(result)}
										}
									}
								})}, 1000)
  },
  cancelAutoStartErrorChkInt(){
	if (!!autoErrorCheckInterval){
		Meteor.clearInterval(autoErrorCheckInterval)
		autoErrorCheckInterval = ''
	}
  },
  chkArmedShow() {
	checkArmedShow.set(!!Shows.findOne({ isArmedForAutoStart: true }))
	if (checkArmedShow.get()){
		armedShowId = Shows.findOne({ isArmedForAutoStart: true })._id
	}
	else {
		if (!!Shows.findOne({ _id: armedShowId, isActive: true, $or: [{ userId: Meteor.userId() }, { helperUserId: Meteor.userId() }]})){
			FlowRouter.go('liveShow')
		}
	}
  },
})

Template.producerShows.onCreated(function() {
  this.autorun(() => {
    this.subscribe('producerShows')
    this.subscribe('allUsersAdmin')
  })
})

Template.producerShows.events({
  'click [data-deactivate-show-id]'(e, t) {
    var showId = $(e.currentTarget).attr('data-deactivate-show-id')
    Meteor.call('deactivateShow', showId)
  },
  'click [data-activate-show-id]'(e, t) {
    var showId = $(e.currentTarget).attr('data-activate-show-id')
    Meteor.call('activateShow', showId, function(error, result){
											if (!!error){
												console.log(error)
												console.log(error.reason)
												alert("Error starting show")
											}
											else{
    											FlowRouter.go('liveShow')
											}
										})
  },
  'click [data-delete-id]'(e, t) {
    if (confirm('Are You sure want to delete this?')) {
      var showId = $(e.currentTarget).attr('data-delete-id')
      Meteor.call('removeShow', showId)
    }
  },
  'click [data-duplicate-id]'(e, t) {
    var showId = $(e.currentTarget).attr('data-duplicate-id')
    //var showName = prompt('Duplicate Show Name?')
    //if (showName && showId) {
    //  Meteor.call('duplicateShow', showId, showName)
    //}

	var showObject = {}

	$('#duplicateShowModal').modal()
	
	$('#duplicateShowModal').one('hidden.bs.modal', function() {
		var copyTracks = $('#duplicateShowModal').find('input[id="copyTracks"]').prop('checked')
		var showName = $('#duplicateShowModal').find('input[id="showName"]').val()
		var weOK = $.data(duplicateShowModal,"weOK")
		
		//console.log(copyTracks)
		//console.log(showName)
		//console.log(weOK)
		
		showObject = JSON.parse('{ "showName" : "' +
								showName + 
								'", "copyTracks": ' +
								copyTracks +
								'}')
								
		//console.log(showObject)
		
		if (weOK && showObject && showId) {
			if (showObject.showName){
     			Meteor.call('duplicateShow', showId, showObject)
			}
			else{
				alert('A Show Name must be entered to duplicate.')
			}
    	}
	
		$('#duplicateShowModal').find('input[id="copyTracks"]').val('on')
		$(this).find('input[id="copyTracks"]').prop('checked', true)
		$('#duplicateShowModal').find('input[id="showName"]').val('')
		$.data(duplicateShowModal,"weOK",false)
	})
  },
  'click [data-stop-auto-start-show-id]'(e, t) {
    var showId = $(e.currentTarget).attr('data-stop-auto-start-show-id')
    Meteor.call('removeAutoStartShow', showId)
  },
  'click [data-auto-start-show-id]'(e, t) {
    var showId = $(e.currentTarget).attr('data-auto-start-show-id')
	Meteor.call('addAutoStartShow', showId, function(error, result){
  									if(error){
    									console.log(error.reason);
										console.log('Error AutoStarting Show')
										alert('There was an error on enable Auto Start. Auto Start currently disabled.')
  									}
									else{
										if(!result){
											alert('All tracks must have a track length of at least "00:01" to enable Automation tools!')
										}
									}
								})
  },
  'click [data-create-show]'() {
    Meteor.call('createNewShow')
  },
  'click [data-edit-show-id]'(e, t) {
    var showId = $(e.currentTarget).attr('data-edit-show-id')
    Session.set('showEditingId', showId)
  },
  'click [data-gimme-show-stats]'(e, t) {
    FlowRouter.go('showStats')
  },
})
