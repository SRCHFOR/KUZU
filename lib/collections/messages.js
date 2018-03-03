Messages = new Mongo.Collection("messages");

Messages.attachSchema({
  producerId: {
    type: String,
    label: "Producer Id"
  },
  showId: {
    type: String,
    label: "Show Id"
  },
  content: {
    type: String,
    label: "Message content"
  },
  sentAt: {
    type: Date,
    label: "Sent At",
    autoValue() {
      if(this.isInsert) {
        return new Date();
      }
    }
  },
  sentBy: {
    type: String,
    label: "Sent By",
    optional: true
  },
  isRead: {
    type: Boolean,
    label: "Is message read",
    defaultValue: false
  }
});