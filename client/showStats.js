//import momenttz from 'moment-timezone'
Template.showStats.onCreated(function() {
  Session.set('dataDL', false)
  /*this.autorun(() => {
	this.subscribe('producerShows')
	this.subscribe('allUserTracks')
  })*/
})

Template.showStats.onRendered(function() {
	this.autorun(() => {
		Meteor.call('getShowStatsData', Meteor.userId(), function(error, result){
    										var colheaders = ['Artist', 'Song', 'Album', 'Label', 'Length', 'Type', 'Order', 'Date', 'Show']
						
											if (!!error){
												alert("Error getting showStats")
												
												var result = ['Error', 'Error', 'Error', 'Error', 'Error', 'Error', 'Error', 'Error', 'Error']
												$("#handsontable").handsontable({
    												data: result,
													columnSorting: true,
    												colHeaders: true,
													rowHeaders: true,
    												contextMenu: true,
  													manualColumnResize: true,
													colHeaders: function(col){
														if (col <= colheaders.length-1){
															return colheaders[col]
														}
    												}
												})
												
												console.log(error)
												console.log(error.reason)
											}
											else{
												Session.set('dataDL', result)
												
												$("#handsontable").handsontable({
    												data: result,
													columnSorting: true,
    												colHeaders: true,
													rowHeaders: true,
    												contextMenu: true,
  													manualColumnResize: true,
													colHeaders: function(col){
														if (col <= colheaders.length-1){
															return colheaders[col]
														}
    												}
												})
											}
		})
		
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		//!!!!!!!!!!!!   Moved to getShowStatsData method in methods.js   !!!!!!!!!!!!!!!!
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		
		/*
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
		
		//Field order record so that any undefined properties don't shorten the output record in the handsontable table
		//Field order record must be in the same order as the handsontable header
		allUserTracks.unshift(JSON.parse('{ "artist" : "",' +
										'"songTitle" : "",' +
										'"album" : "",' +
										'"label" : "",' +
										'"trackLength" : "",' +
		//								'"showId" : "id",' +
										'"trackType" : "",' +
										'"indexNumber" : "",' +
										'"playDate" : "",' +
		//								'"_id" : "id2",' +
										'"showName" : ""' +
										'}'))
		//delete allUserTracks[0].showId
		//delete allUserTracks[0]._id
		//console.log(allUserTracks)
		//console.log('hi')
		
		var allUserShows = Shows.find(
		{
			userId: Meteor.userId()
		}, 
		{
			fields: {showName : 1}
		}
		).fetch()
		//console.log(allUserShows)
		//console.log('hi2')
		
		//Version 1 (runs slow)
		/*var data = function () {
			if (allUserShows.length == 0 && allUserTracks.length == 1){}
			else{
			for (var docNo = 0; docNo <= allUserShows.length-1; docNo++){
				for (var docNo2 = 0; docNo2 <= allUserTracks.length-1; docNo2++){
					if (allUserShows[docNo]._id == allUserTracks[docNo2].showId){
						if (!!allUserTracks[docNo2].playDate){
							allUserTracks[docNo2].playDate = allUserTracks[docNo2].playDate.toLocaleString()
							allUserTracks[docNo2].playDate.toLocaleString()
							//allUserTracks[docNo2].playDate = momenttz(new Date(allUserTracks[docNo2].playDate)).tz('America/Chicago')
						}
						if (!!allUserTracks[docNo2].showId){
							delete allUserTracks[docNo2].showId
						}
						if (!!allUserTracks[docNo2]._id){
							delete allUserTracks[docNo2]._id
						}
						allUserTracks[docNo2] = {
							...allUserTracks[docNo2],
							showName: allUserShows[docNo].showName
						}
					}
				}
			}
			}
			
			//console.log(allUserShows)
			//console.log(allUserTracks)
			
			return allUserTracks
    		//return Handsontable.helper.createSpreadsheetData(100, 10);
  		}*/

		/*
		// Version 2
		var data = function () {
			var returnAllUserTracks = [{}]
			var docNo3 = 0
			if (allUserShows.length == 0 && allUserTracks.length == 1){}
			else{
			for (var docNo = 0; docNo <= allUserShows.length-1; docNo++){
				for (var docNo2 = 0; docNo2 <= allUserTracks.length-1; docNo2++){
					if (allUserShows[docNo]._id == allUserTracks[docNo2].showId){
						returnAllUserTracks[docNo3] = {
							...allUserTracks[docNo2],
							showName: allUserShows[docNo].showName
						}
						if (!!returnAllUserTracks[docNo3].playDate){
							returnAllUserTracks[docNo3].playDate = new moment(new Date(returnAllUserTracks[docNo3].playDate)).format('MMMM Do YYYY h:mm:ss a')
							//returnAllUserTracks[docNo3].playDate = momenttz(new Date(returnAllUserTracks[docNo3].playDate)).tz('America/Chicago').format('MMMM Do YYYY h:mm:ss a')
						}
						if (!!returnAllUserTracks[docNo3].showId){
							delete returnAllUserTracks[docNo3].showId
						}
						if (!!returnAllUserTracks[docNo3]._id){
							delete returnAllUserTracks[docNo3]._id
						}
						if(docNo2 == 0){
							allUserTracks.shift()
						}else{
						if(docNo2 == allUserTracks.length-1){
							allUserTracks.pop()
						}else{
							allUserTracks.splice(docNo2,1)
						}}
						docNo2--
						docNo3++
					}
				}
			}
			}
			
			returnAllUserTracks.unshift(allUserTracks[0])
			
			//console.log(allUserTracks)
			//console.log(allUserShows)
			//console.log(returnAllUserTracks)
			//console.log(docNo3)
			
			//if allUserTracks.length > 1 then tack on leftover tracks
			for(;allUserTracks.length > 1;){
				//allUserTracks[0] starts with the field order record so shifting first makes it even easier
				allUserTracks.shift()
				returnAllUserTracks.push(allUserTracks[0])
			}
			//console.log(returnAllUserTracks)
			
			return returnAllUserTracks
    		//return Handsontable.helper.createSpreadsheetData(100, 10);
  		}

		//var colheaders = ['Album', 'Artist', 'Order', 'Label', 'Date', 'Show', 'Song', 'Length', 'Type']
		var colheaders = ['Artist', 'Song', 'Album', 'Label', 'Length', 'Type', 'Order', 'Date', 'Show']
		
  		$("#handsontable").handsontable({
    		data: data(),
			columnSorting: true,
    		colHeaders: true,
			rowHeaders: true,
    		contextMenu: true,
  			manualColumnResize: true,
			colHeaders: function(col){
				if (col <= colheaders.length-1){
					return colheaders[col]
				}
    		}
		})
		*/
	})
})

Template.showStats.events({
  'click #exportcsv': function() {
	var data = Session.get('dataDL')
	if (!!data){
		//remove blank row
		data.shift()
		//add header row
		//Field order record must be in the same order as the handsontable header
		data.unshift(JSON.parse('{ "artist" : "artist",' +
								'"songTitle" : "songTitle",' +
								'"album" : "album",' +
								'"label" : "label",' +
								'"trackLength" : "trackLength",' +
		//						'"showId" : "showId",' +
								'"trackType" : "trackType",' +
								'"indexNumber" : "order",' +
								'"playDate" : "playDate",' +
		//						'"_id" : "userid",' +
								'"showName" : "showName"' +
								'}'))
    	var nameFile = moment().format() + '_showstats.csv'
		var fileContent = () => {
			return data.map(it => {
    			return Object.values(it).toString()
  			}).join('\n')
		}
    	var blob = new Blob([fileContent()], { type: 'text/plain;charset=utf-8' })
        saveAs(blob, nameFile)
	}
   },
})
