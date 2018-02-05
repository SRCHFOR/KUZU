Template.showsList.helpers({
  showsIndex() {
    return ShowsIndex;
  },
  hasFullUI(){
    return (this.helperUserId !== Meteor.userId() || Meteor.user().isAdmin || this.userId === Meteor.userId())
  }
});

Template.showsList.events({
  "click [data-deactivate-show-id]"(e, t) {
    var showId = $(e.currentTarget).attr("data-deactivate-show-id");
    Meteor.call("deactivateShow", showId);
  },
  "click [data-activate-show-id]"(e, t) {
    var showId = $(e.currentTarget).attr("data-activate-show-id");
    Meteor.call("activateShow", showId);
    FlowRouter.go("showStatus")
  },
 "click [data-delete-id]"(e, t) {
    if(confirm("Are You sure want to delete this?")){
      var showId = $(e.currentTarget).attr("data-delete-id");
      Meteor.call("removeShow", showId);
    }
  },
  "click [data-duplicate-id]" (e, t) {
    var showId = $(e.currentTarget).attr('data-duplicate-id');
    var showName = prompt("Duplicate Show Name?");
    if(showName && showId) {
      Meteor.call("duplicateShow", showId, showName)
    }
  },
  "click [data-duplicate-tracks-id]" (e, t) {
    var showId = $(e.currentTarget).attr('data-duplicate-tracks-id');
    var showName = prompt("Duplicate Show Name?");
    if(showName && showId) {
      Meteor.call("duplicateShowWithTracks", showId, showName)
    }
  },
  "click [data-stop-auto-start-show-id]"(e, t) {
    var showId = $(e.currentTarget).attr('data-stop-auto-start-show-id');
    Meteor.call("removeAutoStartShow", showId);
  },
  "click [data-auto-start-show-id]"(e, t) {
    var showId = $(e.currentTarget).attr('data-auto-start-show-id');
    Meteor.call("addAutoStartShow", showId);
  }
})
