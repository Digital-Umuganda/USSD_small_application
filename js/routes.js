

const fs = require('fs');
const url = require('url');
const path = require('path');
const testServer = require('./testServer');
const queryString = require('querystring');


module.exports.request = (req, res) => {
	var reqBody = '';
	if (req.method == 'GET')
		parseReq(req, res, reqBody);
	else if (req.method == 'POST') {
		req.on('data', (data) => {
			reqBody += data;
		});
		req.on('end', () => {
			parseReq(req, res, reqBody);
		});
	}
}


parseReq = (req, res, data) => {
	if (req.url == '/') {
		getRequestedFile(res, './index.html', 'text/html');
	} else if (req.url == '/favicon.ico') {
		getRequestedFile(res, './icons/logoDigitalUmuganda.png', 'image/apng');
	} else if (req.url == '/icons/userSignUp.svg') {
		getRequestedFile(res, './icons/userSignUp.svg', 'image/svg+xml');
	} else if (req.url == '/icons/userSignIn.svg') {
		getRequestedFile(res, './icons/userSignIn.svg', 'image/svg+xml');
	} else if (req.url == '/icons/search.svg') {
		getRequestedFile(res, './icons/search.svg', 'image/svg+xml');
	} else if (req.url == '/icons/home.svg') {
		getRequestedFile(res, './icons/home.svg', 'image/svg+xml');
	} else if (req.url == '/icons/copyright.svg') {
		getRequestedFile(res, './icons/copyright.svg', 'image/svg+xml');
	} else if (req.url == '/css/style.css') {
		getRequestedFile(res, './css/style.css', 'text/css');
	} else if (req.url == '/js/script.js') {
		getRequestedFile(res, './js/script.js', 'text/js');
	} else if (url.parse(req.url, true).pathname == '/data') {
		getRequestedData(data, res);
	}
}


getRequestedFile = (res, filePath, contentType) => {
	fs.readFile(filePath, null, (err, data) => {
		if (err) {
			Error.captureStackTrace(err);
			console.log(err.stack);
			res.statusCode = 200;
			res.setHeader('Content-Type', 'text/plain');
			res.end('An error occured while reading ' + filePath);
		} else {
			res.statusCode = 200;
			res.setHeader('Content-Type', contentType);
			res.end(data);
			console.log(filePath + ' sent to client');
		}
	});
}


getRequestedData = (data, res) => {
	requestedData = {'totalNGrams':0};
	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/json');
	testServer.getTestResult(getReqParam(data), res);
}


getReqParam = (reqData) => {
	data = queryString.parse(reqData);
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
		reqFreq: {
			timeSec: data.time,
			reqPerMin: data.reqPerMin,
			asyncReq: data.asyncReq,
			reqFreq: (60 / data.reqPerMin) * 1000
		}
	};

	return {'opts':opts, 'reqDtls':reqDtls};
}