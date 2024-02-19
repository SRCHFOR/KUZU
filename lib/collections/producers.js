/*Producers = new Mongo.Collection("producers");

Producers.allow({
  insert: function(userId,doc){
    return !!userId;
  },
  update: (userId,doc)=> {
    return !!userId;
  }
});

Producers.helpers({
  user(){
    return Meteor.users.findOne({_id: this.userId})
  }
})

Producers.attachSchema({
  name: {
    type: String,
    label: "Producer name"
  },
  showName:{
    type: String,
    label: "Defaul Show Name",
  },
  defaultMeta: {
    type: String,
    label: "Default Show Meta Data (When you don't want song title and artist name on media player)",
    optional: true
  },
  description: {
    type: String,
    label: "Default Show Description",
    autoform: {
      afFieldInput: {
        type: 'summernote',
        settings: {
		  callbacks: {
			onPaste: function(e) {
			  // using timeout callback so the picture has long enough to register on page and can be scrubbed completely.
			  setTimeout(function(){
			  //alert('You must use an HTML link to your picture.')
			  var imglength = $('#summernote').summernote('code').context.images.length;
			  if(imglength >= 1){
				var img = $('#summernote').summernote('code').context.images
			  
				for(var i = 0; i < imglength; i++){
					// always use img[0] and not img[i] because the object is activily reworked to where the current image is always img[0]
					// var i is just used to count up to imglength
					if(img[0].outerHTML == '<img>'){
						img[0].outerHTML = ''
					}
					else if(img[0].outerHTML.search('data:image') >= 0){
						img[0].outerHTML = '<p>Your image has been removed</p>'
					}
				}
			  }
			  },4)
    		},
			onImageUpload: function(files) {
			  //console.log('imgupload')
			  //console.log($('#summernote').summernote('code'))
	
			  alert('You must use an HTML link to your picture.')
	
			  // using timeout callback so the picture has long enough to register on page and can be scrubbed completely.
			  setTimeout(function(){
			  var imglength = $('#summernote').summernote('code').context.images.length;
			  if(imglength >= 1){
				var img = $('#summernote').summernote('code').context.images
			  
				for(var i = 0; i < imglength; i++){
					// always use img[0] and not img[i] because the object is activily reworked to where the current image is always img[0]
					// var i is just used to count up to imglength
					if(img[0].outerHTML == '<img>'){
						img[0].outerHTML = ''
					}
					else if(img[0].outerHTML.search('data:image') >= 0){
						img[0].outerHTML = '<p>Your image has been removed</p>'
					}
				}
			  }
			  },4)
	
    	    },
    	  },
		},
      }
    },
    optional: true
  },
  bio: {
    type: String,
    label: "Producer Bio",
    autoform: {
      afFieldInput: {
        type: 'summernote',
        settings: {
		  callbacks: {
			onPaste: function(e) {
			  // using timeout callback so the picture has long enough to register on page and can be scrubbed completely.
			  setTimeout(function(){
			  //alert('You must use an HTML link to your picture.')
			  var imglength = $('#summernote').summernote('code').context.images.length;
			  if(imglength >= 1){
				var img = $('#summernote').summernote('code').context.images
			  
				for(var i = 0; i < imglength; i++){
					// always use img[0] and not img[i] because the object is activily reworked to where the current image is always img[0]
					// var i is just used to count up to imglength
					if(img[0].outerHTML == '<img>'){
						img[0].outerHTML = ''
					}
					else if(img[0].outerHTML.search('data:image') >= 0){
						img[0].outerHTML = '<p>Your image has been removed</p>'
					}
				}
			  }
			  },4)
    		},
			onImageUpload: function(files) {
			  //console.log('imgupload')
			  //console.log($('#summernote').summernote('code'))
	
			  alert('You must use an HTML link to your picture.')
	
			  // using timeout callback so the picture has long enough to register on page and can be scrubbed completely.
			  setTimeout(function(){
			  var imglength = $('#summernote').summernote('code').context.images.length;
			  if(imglength >= 1){
				var img = $('#summernote').summernote('code').context.images
			  
				for(var i = 0; i < imglength; i++){
					// always use img[0] and not img[i] because the object is activily reworked to where the current image is always img[0]
					// var i is just used to count up to imglength
					if(img[0].outerHTML == '<img>'){
						img[0].outerHTML = ''
					}
					else if(img[0].outerHTML.search('data:image') >= 0){
						img[0].outerHTML = '<p>Your image has been removed</p>'
					}
				}
			  }
			  },4)
	
    	    },
    	  },
		},
      }
    },
    optional: true
  },
  userId: {
    type: String,
    label: "User",
    autoform: {
      afFieldInput: {
        options() {
          var users = Meteor.users.find().fetch();
          var usersArray = [];
          _.each(users, function(user){
            usersArray.push({label: user.emails[0].address, value: user._id});
          });
          return usersArray;
        }
      }
    }
  }
})*/
