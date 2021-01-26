


const http = require('http');
const queryString = require('querystring');
const testServer = require('./testServer');

const hostname = '127.0.0.1';
const port = 3000;

//remember to log these into the log files
const data = {
	'case':'2',
	'time':'60', //total time to run the server test
	'reqPerMin':'10000', //requests per minute
	'asyncReq':'50', //Concurrent requests
	'minAsyncReq':'1',
	'maxAsyncReq':'10',
	'serverAddr':'10.10.77.252',
	'serverPort':'8088',
	'remotePath':'/mbazaussd/ussd',//make sure the path doesn't end with a '/'
	'method':'GET',
	'output':'Web',
	'logIndividualReq':'false'
}

const server = http.createServer((req, res) => {
	routes.request(req, res);
});


getReqParam = (data) => {
	const opts = {
		host: data.serverAddr,
		port: data.serverPort,
		path: data.remotePath,
		method: data.method,
		headers: {
			'content-type': 'appliction/text',
			'content-length': 20
		}
	};

	const reqDtls = {
		output: data.output,
		case: data.case,
		logRequests: data.logIndividualReq,
		reqFreq: {
			timeSec: data.time,
			reqPerMin: data.reqPerMin,
			asyncReq: data.asyncReq,
			minAsyncReq: data.asyncReq,
			reqFreq: (60 * 1000 * data.asyncReq) / data.reqPerMin
		}
	};
	
	return {'opts':opts, 'reqDtls':reqDtls};
}

runTest = new testServer.serverTests(getReqParam(data), server.res)
runTest.getTestResult();