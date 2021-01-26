

getDataStats = () => {
	var xhttp = new XMLHttpRequest();
	xhttp.open('POST', 'http://localhost:3000/data', true);
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			data = JSON.parse(this.responseText);
			console.log(data)
		}
	}
	xhttp.send(getReqParams());
}


getReqParams = () => {
	var reqParams = 'case=' + 2;
	var reqParams = reqParams + '&time=' + 60; //total time to run the server test
	var reqParams = reqParams + '&reqPerMin=' + 100; //requests per minute
	var reqParams = reqParams + '&asyncReq=' + 10; //Concurrent requests
	var reqParams = reqParams + '&minAsyncReq=' + 1;
	var reqParams = reqParams + '&maxAsyncReq=' + 10;
	var reqParams = reqParams + '&serverAddr=' + '10.10.77.252';
	var reqParams = reqParams + '&serverPort=' + 8088;
	var reqParams = reqParams + '&remotePath=' + '/mbazaussd/ussd';//make sure the path doesn't end with a '/'
	var reqParams = reqParams + '&method=' + 'GET';
	var reqParams = reqParams + '&output=' + 'Web';
	var reqParams = reqParams + '&logIndividualReq=' + 'false';//logs individual requests details if set to true
	return reqParams;
}


getDataStats();