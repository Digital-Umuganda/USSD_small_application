server load test deployment

configure server test details in ./js/script.js

	- line 20: '&time=' + 60; //total time to run the server test
	- line 21: '&reqPerMin=' + 10; //requests per minute
	- line 22: '&asyncReq=' + 1; //Concurrent requests

	and configure server requests details on line 25 to 28

	then run:
		- node ./js/nodeServer.js