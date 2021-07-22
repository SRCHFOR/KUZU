ProductionStatuses = new Mongo.Collection('productionStatuses')

ProductionStatuses.allow({
  insert: function(userId, doc) {
    return !!userId
  },
  update: (userId, doc) => {
    return !!userId
  },
})

ProductionStatuses.attachSchema({
  productionStatusName: {
    type: String,
    label: 'Production Status Name',
  },
  metaData: {
    type: String,
    label: 'Meta Data',
  },
  isShowingMetaData: {
    type: Boolean,
    label: 'Show Meta Data',
  },
  additionalContent: {
    type: String,
    autoform: {
      afFieldInput: {
        type: 'summernote',
        class: 'editor',
        settings: {
		  callbacks: {
			onPaste: function(e) {
			  // using timeout callback so the picture has long enough to register on page and can be scrubbed completely.
			  setTimeout(function(){
			  alert('You must use an HTML link to your picture.')
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
	
			  // using timeout callback so the picture has long enough to register on page and can be scrubbed completely.
			  setTimeout(function(){
			  alert('You must use an HTML link to your picture.')
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
  isShowingAdditionalContent: {
    type: Boolean,
    label: 'Show Additional Content',
  },
  isActive: {
    type: Boolean,
    label: 'Is this production status active?',
  },
  userId: {
    type: String,
    autoValue() {
      if (this.isInsert) {
        return this.userId
      }
    },
    autoform: {
      type: 'hidden',
    },
  },
  producersNote: {
    type: String,
    autoform: {
      afFieldInput: {
        type: 'summernote',
        class: 'editor',
        settings: {
		  callbacks: {
			onPaste: function(e) {
			  // using timeout callback so the picture has long enough to register on page and can be scrubbed completely.
			  setTimeout(function(){
			  alert('You must use an HTML link to your picture.')
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
	
			  // using timeout callback so the picture has long enough to register on page and can be scrubbed completely.
			  setTimeout(function(){
			  alert('You must use an HTML link to your picture.')
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
})
