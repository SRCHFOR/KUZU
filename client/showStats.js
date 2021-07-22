/*Template.showStats.helpers({
  helpme: function() {},
})*/

Template.showStats.onRendered(function() {
	this.autorun(() => {
		
		this.subscribe('producerShows')
		this.subscribe('allUserTracks')
		var allUserTracks = Tracklists.find(
      	{
        	userId: Meteor.userId() 
      	},
		{ 
			fields: { isHighlighted: 0, userId: 0 } 
		},
      	{ 
			sort: { indexNumber: 1 } 
		}
    	).fetch()
		allUserTracks.unshift(JSON.parse('{ "album" : "",' +
										'"artist" : "",' +
										'"indexNumber" : "",' +
										'"label" : "",' +
										'"playDate" : "",' +
										'"showId" : "id",' +
										'"showName" : "",' +
										'"songTitle" : "",' +
										'"trackLength" : "",' +
										'"trackType" : "",' +
										'"_id" : "id2"' +
										'}'))
		//console.log(allUserTracks)
		//console.log('hi')
		
		var allUserShows = Shows.find(
		{
			userId: Meteor.userId()
		}, 
		{
			fields: {showName : 1, showId : 1}
		}
		).fetch()
		//console.log(allUserShows)
		//console.log('hi2')
			
		var data = function () {
			for (var docNo = 0; docNo <= allUserShows.length-1; docNo++){
				for (var docNo2 = 0; docNo2 <= allUserTracks.length-1; docNo2++){
					if (allUserShows[docNo]._id == allUserTracks[docNo2].showId){
						allUserTracks[docNo2] = {
							...allUserTracks[docNo2],
							showName: allUserShows[docNo].showName
						}
					}
				}
			}
			
			for (var docNo3 = 0; docNo3 <= allUserTracks.length-1; docNo3++){
				if (!!allUserTracks[docNo3].playDate){
					allUserTracks[docNo3].playDate = allUserTracks[docNo3].playDate.toLocaleString()
				}
				if (!!allUserTracks[docNo3].showId){
					delete allUserTracks[docNo3].showId
				}
				if (!!allUserTracks[docNo3]._id){
					delete allUserTracks[docNo3]._id
				}
			}
			
			return allUserTracks
    		//return Handsontable.helper.createSpreadsheetData(100, 10);
  		}

		var colheaders = ['Album', 'Artist', 'Order', 'Label', 'Date', 'Show', 'Song', 'Length', 'Type']

  		$("#handsontable").handsontable({
    		data: data(),
			columnSorting: true,
    		colHeaders: true,
			rowHeaders: true,
    		contextMenu: true,
  			manualColumnResize: true,
			colHeaders: function(col){
    			return colheaders[col]
    		}
		})
	
	})
})

Template.producerShows.onCreated(function() {
	this.autorun(() => {
    	this.subscribe('allUsersAdmin')
  	})
})

//Template.showStats
