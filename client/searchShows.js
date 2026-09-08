function fixIdLocal(badId){
	return badId.match(/^[a-zA-Z0-9]{17}/)?.[0].trim()
 }

Template.searchShows.helpers({
  producerShowsIndex() {
    return producerShowsIndex
  },
  isLoadMoreDisabled(){
	return Session.get('showButtonDisabled')
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
})

Template.searchShows.onCreated(function() {
  this.autorun(() => {
    //this.subscribe('producerShows')
    this.subscribe('allUsersAdmin')
  })
})

Template.searchShows.events({
  'click [data-duplicate-id]'(e, t) {
    var showId = fixIdLocal($(e.currentTarget).attr('data-duplicate-id'))//.match(/^[a-zA-Z0-9]{17}/)?.[0].trim()//.replace(/["{}]/g, '').trim()
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
  'click [data-edit-show-id]'(e, t) {
    var showId = fixIdLocal($(e.currentTarget).attr('data-edit-show-id'))//.match(/^[a-zA-Z0-9]{17}/)?.[0].trim()//.replace(/["{}]/g, '').trim()
    Session.set('showEditingId', showId)
  },
  'click [trigger-next-wdate-set]'(e, t) {
    producerShowsIndex.getComponentMethods().loadMore(producerShowsIndex.defaultSearchOptions.limit)
			
	//force wait before checking dict to compensate for broken backend if not using searchbar
	//if (!Session.get('usingSearchBar')){
		//e.currentTarget.disabled =  true
		Session.set('showButtonDisabled', true)
    	Meteor.setTimeout(() => {
			/*console.log(producerShowsIndex.getComponentMethods())
			console.log(producerShowsIndex.getComponentDict())
			console.log(producerShowsIndex.getComponentDict().keys.currentCount)
			console.log(producerShowsIndex.getComponentDict().keys.count)
			console.log(producerShowsIndex.getComponentDict().keys.limit)*/
			var dict = producerShowsIndex.getComponentDict()
			if (Number(dict.keys.currentCount) < Number(dict.keys.limit)) {
      			confirm('No more Shows to load')
				//Reset button after confirm
				//Session.set('showButtonDisabled', false)
    		}
			else{
				//e.currentTarget.disabled = false
				Session.set('showButtonDisabled', false)
			}
    	}, 2500); //2.5 seconds
	/*}
	else{
		//e.currentTarget.disabled =  true
		Session.set('showButtonDisabled', true)
    	Meteor.setTimeout(() => {
			//e.currentTarget.disabled = false
			Session.set('showButtonDisabled', false)
    	}, 2500); //2.5 seconds
	}*/
  },
})
