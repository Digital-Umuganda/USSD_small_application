How to run a server load test:

	- configure server test details in './js/runServerTest' from line 12 to 23
		'case':'2',//test scenarios
		'time':'60', //total time to run the server test
		'reqPerMin':'100', //requests per minute
		'asyncReq':'10', //Concurrent requests(applies only in case scenario 2)
		'minAsyncReq':'1', //minimum asynchronous requests
		'maxAsyncReq':'10', //maximum asynchronous requests
		'serverAddr':'10.10.77.252', //ussd server address
		'serverPort':'8088',// ussd server port
		'remotePath':'/mbazaussd/ussd',//make sure the path doesn't end with a '/'
		'method':'GET',
		'output':'Web',
		'logIndividualReq':'false' //log individual request details

	- then run:
		- 'npm start'


Notes:
	case 1:
		- sends one request at a time
	case 2:
		- sends the same number of requests at the same time
	case 3:
		- sends varying number of requests at the same time