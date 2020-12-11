
const queryString = require('querystring');
const http = require('http');
serverResponses = 0;


module.exports.getTestResult = (requestedData, req, res) => {
  var totalReq = 0, totalAsyncReq = 0, responseBody = [], lastReq = 0;
  var initTime = (new Date().getTime() / 1000).toFixed(0);
  var path = requestedData['opts'].path;
  reqDtls = getReqDtlsFreq(requestedData['reqDtls']);

  var reqTimer = setInterval(() => {
    var elapsedTime = (new Date().getTime() / 1000).toFixed(0);
    reqFreq = reqDtls.reqFreq;
    if (reqFreq.timeSec > elapsedTime - initTime && totalReq < reqFreq.reqPerMin) {
      reqDtls = getReqDtlsAsync(requestedData['reqDtls']);
      reqFreq = reqDtls.reqFreq;
      totalAsyncReq++;
      responseBody[totalAsyncReq] = [];
      for (var i = 0; i < reqFreq.asyncReq || i < reqFreq.minAsyncRep; i++) {
        lastReq, responseBody[totalAsyncReq][i] = sendRequest({ totalReq: totalReq, 
          requestedData: requestedData, path: path, req: req,  res: res, totalAsyncReq: totalAsyncReq, 
          i: i, elapsedTime: elapsedTime
        });
        if (lastReq) {
          res.end(responseBody);
          console.log('Server test result sent to client');
          clearInterval(reqTimer);
        }
      }
    }
  }, reqDtls.reqFreq.reqFreq);
  return responseBody;
}


sendRequest = (reqData) => {
  var reqElapsedTime = (new Date().getTime() / 1000).toFixed(0);
  var body = '';
  reqData.totalReq++;
  lastReq = 0;
  const req = http.get(getServerParams(reqData.requestedData['opts'], reqData.path), (res) => {
    res.on('data', (data) => {
      body += data;
      console.log(data.toString());
    });
    req.on('end', () => {
      serverResponses++;
      console.log(body);
      if (serverResponses == reqData.totalReq)
        return 1, reqData.elapsedTime - reqElapsedTime;
      return 0, reqData.elapsedTime - reqElapsedTime;
    });
  });
}


getServerParams = (opts, path) => {
  opts.path = path +  '?msisdn=078' + (Math.random() * 10000000).toFixed(0) + '&input=114&newRequest=1'
  console.log('http://' + opts.host + ':' + opts.port + opts.path)
  return 'http://' + opts.host + ':' + opts.port + opts.path;
}


getReqDtlsFreq = (reqDtls) => {
  reqFreq = reqDtls.reqFreq;
  if (reqDtls.case == 1) {
    reqFreq.reqFreq = (60 * 1000) / reqFreq.reqPerMin;
  } else if (reqDtls.case == 2) {
    reqFreq.reqFreq = (60 * 1000) * asyncReq / reqFreq.reqPerMin;
    reqFreq.asyncReq = 10;
    reqFreq.minAsyncReq = 10;
  } else if (reqDtls.case == 3) {
    reqFreq.minAsyncRep = 50;
    reqFreq.asyncReq = Math.floor(Math.random() * 10) + 1;
  }
  reqDtls.reqFreq = reqFreq;
  return reqDtls;
}


getReqDtlsAsync = (reqDtls) => {
  reqFreq = reqDtls.reqFreq;
  if (reqDtls.case == 1) {
    reqFreq.reqPerMin = 100;
  } else if (reqDtls.case == 2) {
    reqFreq.reqPerMin = 50;
    reqFreq.asyncReq = 10;
    reqFreq.minAsyncReq = 10;
  } else if (reqDtls.case == 3) {
    minAsyncReq = queryString.parse(req)['minAsyncReq'];
    maxAsyncReq = queryString.parse(req)['maxAsyncReq'];
    reqFreq.asyncReq = Math.floor(Math.random() * maxAsyncReq) + minAsyncReq;
    if (reqFreq.asyncReq > minAsyncReq)
      reqFreq.asyncReq = minAsyncReq;
    if (eqDtls.asyncReq < maxAsyncReq)
      reqFreq.asyncReq = maxAsyncReq;
  }
  reqDtls.reqFreq = reqFreq;
  return reqDtls;
}