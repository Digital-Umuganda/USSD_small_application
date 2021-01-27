


const http = require('http');
const queryString = require('querystring');
const testServer = require('./testServer');

const hostname = '127.0.0.1';
const port = 3000;


const data = {
	'case':'2',
	'time':'60', //total time to run the server test
	'reqPerMin':'1000', //requests per minute
	'asyncReq':'20', //Concurrent requests
	'minAsyncReq':'10',
	'maxAsyncReq':'50',
	'serverAddr':'10.10.77.252',
	'serverPort':'8088',
	'remotePath':'/mbazaussd/ussd', //make sure the path doesn't end with a '/'
	'method':'GET',
	'output':'Web',
	'logIndividualReq':'1' //logs individual requests details if set to 1 (true)
}

const server = http.createServer((req, res) => {
	routes.request(req, res);
});


//Remember to validate input
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
		case: Number(data.case),
		logRequests: Number(data.logIndividualReq),
		reqFreq: {
			timeSec: Number(data.time),
			reqPerMin: Number(data.reqPerMin),
			asyncReq: Number(data.asyncReq),
			minAsyncReq: Number(data.minAsyncReq),
			maxAsyncReq: Number(data.maxAsyncReq),
			reqFreq: (60 * 1000 * data.asyncReq) / data.reqPerMin
		}
	};
	
	return {'opts':opts, 'reqDtls':reqDtls};
}

runTest = new testServer.serverTests(getReqParam(data), server.res)
runTest.getTestResult();