

getDataStats = () => {
	var xhttp = new XMLHttpRequest();
	xhttp.open('POST', 'http://localhost:3000/data', true);
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			data = JSON.parse(this.responseText);
			sortedData = sortData(data);
			displayDataStats(data['totalNGrams'], sortedData, 10, 1, 1, 2);
			addResultEvents(data['totalNGrams'], sortedData, 10, 1, 1, 2);
		}
	}
	xhttp.send(getReqParams());
}


getReqParams = () => {
	var reqParams = 'case=' + document.getElementById('searchType').value;
	var reqParams = reqParams + '&time=' + 60; //total time to run the server test
	var reqParams = reqParams + '&reqPerMin=' + 10; //requests per minute
	var reqParams = reqParams + '&asyncReq=' + 1; //Concurrent requests
	var reqParams = reqParams + '&minAsyncReq=' + 1;
	var reqParams = reqParams + '&maxAsyncReq=' + 10;
	var reqParams = reqParams + '&serverAddr=' + '10.10.77.252';
	var reqParams = reqParams + '&serverPort=' + 8088;
	var reqParams = reqParams + '&remotePath=' + '/mbazaussd/ussd';//make sure the path doesn't end with a '/'
	var reqParams = reqParams + '&method=' + 'GET';
	var reqParams = reqParams + '&output=' + 'Web';
	return reqParams;
}


displayDataStats = (totalNGrams, data, columns, page, topDecPt, decPt) => {
	var expConst = 0, i = 0, initRow = columns * (page - 1), expVal = 0.00;
	for (var i=initRow; i < initRow + 10 && i < data.length; i++) {
			newRow = document.createElement('div');
			newRowIndex = document.createElement('span');
			newRowText = document.createElement('span');
			newRowCount = document.createElement('span');
			newRowFrequency = document.createElement('span');
			newRow.className = "resultRow";
			newRowIndex.className = 'resultRowIndex';
			newRowText.className = 'resultRowText';
			newRowCount.className = 'resultRowCount';
			newRowFrequency.className = 'resultRowFreq';
			newRowIndex.innerHTML = i + 1;
			newRowText.innerHTML = "'" + data[i]['nGram'] + "'";
			newRowCount.innerHTML = data[i]['count'];
			expVal, expConst = getExpValue(data[i]['count'], totalNGrams, expConst, topDecPt, decPt);
			//console.log(expVal);
			newRowFrequency.innerHTML = expVal.toFixed(decPt);
			buttons = document.getElementById('resultPages');
			newRow.appendChild(newRowIndex);
			newRow.appendChild(newRowText);
			newRow.appendChild(newRowCount);
			newRow.appendChild(newRowFrequency);
			resultWin.insertBefore(newRow, buttons);
	}
	freqHeaderRow = document.getElementsByClassName('resultRowFreq')[0];
	freqHeaderRow.innerHTML = 'Freq (%) x10e' + expConst;
}


sortData = (data) => {
	var i = 0, ngramslist = '';
	var nGrams = [];
	for (entry in data) 
		if (entry !== 'totalNGrams') {
			nGrams.push({nGram:entry, count:data[entry]});
			i++;
		}
	nGrams.sort((a, b) => {
		return b.count - a.count;
	});
	for(var j=0; j< nGrams.length;j++)
		ngramslist += "'" + nGrams[j]['nGram'] + "'\t" + nGrams[j]['count'] + '\n';
	console.log(ngramslist)
	return nGrams;
}


getExpValue = (ngramCount, totalNGrams, expConst, topDecPt) => {
	var cnt = 0, expVal =  ngramCount / totalNGrams;
	if (expVal > 0) {
		if (expConst == 0)
			while (expVal < Math.pow(10, topDecPt - 1)) {
				expVal = expVal * 10;
				expConst++;
			}
		else
			while (expConst > cnt ) {
				expVal = expVal * 10;
				cnt++;
			}
	}
	return expVal, expConst;
}


addResultEvents = (totalNGrams, data, columns, page, topDecPt, decPt) => {
	buttons = document.getElementsByClassName('resultButtons');
	var next, previous, last = getNextPerc(page, data.length, columns);
	for (button in buttons) {
		button.onclick = ((button, next, previous, last) => {
			if (button.id == "resultFirst") {
				displayDataStats(totalNGrams, data, columns, 1, topDecPt, decPt);
			} else if (button.id == "resultPrevious10") {
				displayDataStats(totalNGrams, data, columns, previous, topDecPt, decPt);
			} else if (button.id == "resultPrevious") {
				displayDataStats(totalNGrams, data, columns, page - 1, topDecPt, decPt);
			} else if (button.id == "resultNext") {
				displayDataStats(totalNGrams, data, columns, page + 1, topDecPt, decPt);
			} else if (button.id == "resultNext10") {
				displayDataStats(totalNGrams, data, columns, next, topDecPt, decPt);
			} else if (button.id == "resultLast") {
				displayDataStats(totalNGrams, data, columns, last, topDecPt, decPt);
			}			
		})(button, next, previous, last);
	}
}


getNextPerc = (page, length, columns) => {
	var dec = page.toString().length;
	var last = Math.ceil(length / columns);
	var previous = page, next = page;
	if (page > 10 && page <= last) {
		for (var i=1; i <= dec; i++) {
			previous -= (i == dec) ? 0 : previous % pow(10, i);
			next += pow(10, i) - (next % pow(10, i));
		}
	} else {
		previous = 1;
		next = 20;
	}
	return next, previous, last;
}


getDataStats();