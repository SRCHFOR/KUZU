Template.addTrackToShow.onCreated(function(){
  this.showId = 
  this.autorun(()=>{
    this.subscribe("singleShow", this.showId);
  })
})

Template.addTrackToShow.helpers({
  show(){
  	if(Meteor.user().profile.isAdmin){
  		    return Shows.findOne({_id: FlowRouter.getParam('showId')});
  		}else{
    		  return Shows.findOne({userId: Meteor.userId()},{_id: FlowRouter.getParam('showId')});
  		}
  }
})


AutoForm.hooks({
    insertTracklistFormShow: {
      onSuccess: function() {
        Tracklists.update({showId: FlowRouter.getParam('showId')},$set: {isQueuedForNext: true});
        FlowRouter.go('showtracks',{showId: FlowRouter.getParam('showId')});            
      }
    }
});
