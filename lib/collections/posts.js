Posts = new Mongo.Collection('posts')

Posts.allow({
  insert: (userId, doc) => {
    return !!userId
  },
  update: (userId, doc) => {
    return !!userId
  },
  remove: (userId, doc) => {
    return !!userId
  },
})

Posts.attachSchema({
  title: {
    type: String,
    label: 'Post Title',
  },
  visibleBy: {
    type: [String],
    autoform: {
      afFieldInput: {
        type: 'select-multiple',
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'Pioneer Producers', value: 'pioneer' },
          { label: 'Evergreen Producers', value: 'evergreen' },
          { label: 'Public', value: 'public' },
        ],
      },
    },
  },
  content: {
    type: String,
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
      },
    },
  },
  postDate: {
    type: Date,
    label: 'Post Date',
    autoValue() {
      if (this.isInsert) {
        return new Date()
      }
    },
  },
})
