//import momenttz from 'moment-timezone'

function fetchAllData() {
		var fetchLimit = Number(2500)
		var currentPage = Number(Session.get('pageNum'))
		var colheaders = ['Artist', 'Song', 'Album', 'Label', 'Length', 'Type', 'Order', 'Date', 'Show']
		var currentData = Session.get('dataDL')
		//console.log('currentData1')
		//console.log(currentPage)
		//console.log(currentData)
		
		Meteor.call('getShowStatsData', Meteor.userId(), currentPage, fetchLimit, function(error, result){
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
												//console.log(currentData.allUserTracks.length + ' 5')
												//if (!currentData.allUserTracks.length || currentData.allUserTracks.length < result.totalTracks){
												if (currentData.allUserTracks.length < result.totalTracks){
													//console.log('result1')
													//console.log(result)
													currentData.allUserTracks = currentData.allUserTracks.concat(result.allUserTracks)
													currentData.allUserShows = currentData.allUserShows.concat(result.allUserShows)
													currentData.totalTracks = result.totalTracks
													currentData.totalShows = result.totalShows
													Session.set('dataDL', currentData)
													Session.set('pageNum', currentPage + 1)
													//console.log('currentData3')
													//console.log(currentData)
													fetchAllData();
												}
												else{
													//console.log('currentData2')
													//console.log(currentData)
													//console.log(currentData.allUserTracks.length + ' 4')
			var returnAllUserTracks = [{}]
			var docNo3 = 0
			
			//Field order record so that any undefined properties don't shorten the output record in the handsontable table
			//Field order record must be in the same order as the handsontable header
			currentData.allUserTracks.unshift(JSON.parse('{ "artist" : "",' +
										'"songTitle" : "",' +
										'"album" : "",' +
										'"label" : "",' +
										'"trackLength" : "",' +
			//							'"showId" : "id",' +
										'"trackType" : "",' +
										'"indexNumber" : "",' +
										'"playDate" : "",' +
			//							'"_id" : "id2",' +
										'"showName" : ""' +
										'}'))
			
			//console.log(currentData.allUserTracks.length + ' 3')
			
			if (currentData.allUserShows.length == 0 && currentData.allUserTracks.length == 1){}
			else{
			for (var docNo = 0; docNo <= currentData.allUserShows.length-1; docNo++){
				for (var docNo2 = 0; docNo2 <= currentData.allUserTracks.length-1; docNo2++){
					if (currentData.allUserShows[docNo]._id == currentData.allUserTracks[docNo2].showId){
						//*********
						//add unreturned object properties and rebuild record in correct order
						//*********
						if (!currentData.allUserTracks[docNo2].artist){currentData.allUserTracks[docNo2].artist = ''}
						if (!currentData.allUserTracks[docNo2].songTitle){currentData.allUserTracks[docNo2].songTitle = ''}
						if (!currentData.allUserTracks[docNo2].album){currentData.allUserTracks[docNo2].album = ''}
						if (!currentData.allUserTracks[docNo2].label){currentData.allUserTracks[docNo2].label = ''}
						if (!currentData.allUserTracks[docNo2].trackLength){currentData.allUserTracks[docNo2].trackLength = ''}
						//if (!currentData.allUserTracks[docNo2].showId){currentData.allUserTracks[docNo2].showId = ''}
						if (!currentData.allUserTracks[docNo2].trackType){currentData.allUserTracks[docNo2].trackType = ''}
						if (!currentData.allUserTracks[docNo2].indexNumber){currentData.allUserTracks[docNo2].indexNumber = '' || 0}
						if (!currentData.allUserTracks[docNo2].playDate){currentData.allUserTracks[docNo2].playDate = ''}
						//if (!currentData.allUserTracks[docNo2]._id){currentData.allUserTracks[docNo2]._id = ''}
						if (!currentData.allUserTracks[docNo2].showName){currentData.allUserTracks[docNo2].showName = ''}
						
						//Field order record must be in the same order as the handsontable header
						currentData.allUserTracks[docNo2] = { "artist" : currentData.allUserTracks[docNo2].artist,
										"songTitle" : currentData.allUserTracks[docNo2].songTitle,
										"album" : currentData.allUserTracks[docNo2].album,
										"label" : currentData.allUserTracks[docNo2].label,
										"trackLength" : currentData.allUserTracks[docNo2].trackLength,
										//"showId" : currentData.allUserTracks[docNo2].showId,
										"trackType" : currentData.allUserTracks[docNo2].trackType,
										"indexNumber" : currentData.allUserTracks[docNo2].indexNumber,
										"playDate" : currentData.allUserTracks[docNo2].playDate,
										//"_id" : currentData.allUserTracks[docNo2]._id,
										"showName" : currentData.allUserTracks[docNo2].showName
										}
						//*********
						
						returnAllUserTracks[docNo3] = {
							...currentData.allUserTracks[docNo2],
							showName: currentData.allUserShows[docNo].showName
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
							currentData.allUserTracks.shift()
						}else{
						if(docNo2 == currentData.allUserTracks.length-1){
							currentData.allUserTracks.pop()
						}else{
							currentData.allUserTracks.splice(docNo2,1)
						}}
						docNo2--
						docNo3++
					}
				}
			}
			}
			
			//console.log(currentData.allUserTracks.length + ' 2')
			
			returnAllUserTracks.unshift(currentData.allUserTracks[0])
			
			//console.log(currentData.allUserTracks)
			//console.log(currentData.allUserShows)
			//console.log(returnAllUserTracks)
			//console.log(docNo3)
			
			//if allUserTracks.length > 1 then tack on leftover tracks
			for(;currentData.allUserTracks.length > 1;){
				//allUserTracks[0] starts with the field order record so shifting first makes it even easier
				currentData.allUserTracks.shift()
				returnAllUserTracks.push(currentData.allUserTracks[0])
			}
			//console.log(returnAllUserTracks)
			//console.log(currentData.allUserTracks.length + ' 1')
													
													Session.set('dataDL', returnAllUserTracks)
												
													$("#handsontable").handsontable({
    													data: returnAllUserTracks,
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
											}
		})
}

Template.showStats.onCreated(function() {
	var dataTemplate = {}
  	dataTemplate.allUserTracks = []
	dataTemplate.allUserShows = []
	dataTemplate.totalTracks = 0
	dataTemplate.totalShows = 0
  	Session.set('dataDL', dataTemplate)
  	Session.set('pageNum', 1)
  	/*this.autorun(() => {
		this.subscribe('producerShows')
		this.subscribe('allUserTracks')
  	})*/
})

Template.showStats.onRendered(function() {
	fetchAllData()
	
	//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	//!!!!!!!!!!!!!!!!!!!!   Old unpaginated version  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		
	/*
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
		*/
		
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
	})
	*/
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
