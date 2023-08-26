console.log('hi')

Meteor.startup(function () {

   if(Meteor.isClient) {
      var myNewTemplate = Template.myNewTemplate;
      var myContainer = document.getElementById('myContainer');
      Blaze.render(myNewTemplate, myContainer);
   }
});

if(Meteor.isClient) {
Template.myNewTemplate.helpers({

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

Template.myNewTemplate.events({
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
})
}