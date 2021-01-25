
const queryString = require('querystring');
const http = require('http');
const fs = require('fs');


class responseData {
  constructor(reqIndex, statusCode, sentTime, receivedTime, serverSentTime) {
    this.reqId = (Number((Math.random() * 10000).toFixed(0)) * 100000) + reqIndex
    this.status = statusCode;
    this.sentTime = sentTime;
    this.receivedTime = receivedTime;
  }
}


module.exports.serverTests = class serverTests {
  constructor(requestedData, serverResponse) {
    this.reqData = requestedData;
    this.res = serverResponse;
    this.serverResData = [];
    this.totalReq = 0;
    this.testStartedTime = 0;
  }

  getTestResult = () => {
    this.testStartedTime = new Date().getTime();
    var initTime = (this.testStartedTime / 1000).toFixed(0);
    var reqDtls = this.getReqDtlsFreq(this.reqData['reqDtls']);
    var reqFreq = reqDtls.reqFreq
    
    var reqTimer = setInterval(() => {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      var elapsedTime = (new Date().getTime() / 1000).toFixed(0);
      var percReqSent = ((elapsedTime - initTime) * 100 / reqFreq.timeSec).toFixed(1);
      process.stdout.write( 'Running Performance Test..\t' + percReqSent + '%\t');
      if (reqFreq.timeSec > elapsedTime - initTime) {
        reqDtls = this.getReqDtlsAsync(this.reqData['reqDtls']);
        for (var i = 0; i < reqFreq.asyncReq && i < reqFreq.minAsyncReq; i++) {
          this.sendRequest();
        }
      } else {
        clearInterval(reqTimer);
        this.logResults();
      }
    }, reqDtls.reqFreq.reqFreq);
  }
  
  
  sendRequest = () => {
    var reqSentAt = new Date().getTime();
    const req = http.get(this.getServerParams(), (res) => {
      this.totalReq++;
      res.on('data', (data) => {
        var reqReceivedAt = new Date().getTime();
        this.serverResData.push(new responseData(this.totalReq, res.statusCode, reqSentAt, reqReceivedAt))
      });
      req.on('error', (e) => {
        console.error('Got error: ${e.message}');
      });
    });
  }
  
  
  getServerParams = () => {
    var phoneNumber = '07' + ((Math.random() + 8) * 10000000).toFixed(0)
    var path = this.reqData.opts.path +  '?msisdn=' + phoneNumber + '&input=114&newRequest=1'
    return 'http://' + this.reqData.opts.host + ':' + this.reqData.opts.port + path;
  }
  
  
  getReqDtlsFreq = (reqDtls) => {
    if (reqDtls.case == 1) {
      reqDtls.reqFreq.asyncReq = 1;
      reqDtls.reqFreq.minAsyncReq = 1;
    } else if (reqDtls.case == 2) {
      reqDtls.reqFreq.reqFreq = (60 * 1000) * asyncReq / reqDtls.reqFreq.reqPerMin;
      reqDtls.reqFreq.asyncReq = 10;
      reqDtls.reqFreq.minAsyncReq = 10;
    } else if (reqDtls.case == 3) {
      reqDtls.reqFreq.minAsyncReq = 1;
      reqDtls.reqFreq.asyncReq = Math.floor(Math.random() * 10) + 1;
    }
    return reqDtls;
  }
  
  
  getReqDtlsAsync = (reqDtls) => {
    var reqFreq = reqDtls.reqFreq;
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
      if (reqFreq.asyncReq < minAsyncReq)
        reqFreq.asyncReq = minAsyncReq;
      if (reqDtls.asyncReq > maxAsyncReq)
        reqFreq.asyncReq = maxAsyncReq;
    }
    reqDtls.reqFreq = reqFreq;
    return reqDtls;
  }


  logResults = () => {
    var totalReqTime = 0;
    var testData = '';
    this.serverResData.forEach((value, index, array) => {
      var reqResTime = value.receivedTime - value.sentTime;
      totalReqTime += reqResTime;
      testData += index + '.)\t- Request sent at: ' + this.getTimeFormat(value.sentTime) + '\n';
      testData += '\t- Response received at: ' + this.getTimeFormat(value.receivedTime) + '\n';
      testData += '\t- Request response Time: ' + reqResTime + ' MilliSeconds\n\n';
    });
    var testEndedAt = new Date().getTime();
    var stats = 'Test performed At: ' + new Date(this.testStartedTime) + '\n';
    stats += 'Test ended At: ' + new Date(testEndedAt) + '\n';
    stats += 'Test lasted for: ' + String(testEndedAt - this.testStartedTime) + ' MilliSeconds\n';
    stats += 'Test sent request: ' + this.totalReq + '\n';
    stats += 'Test received request: ' + this.serverResData.length + '\n';
    stats += 'Average Response Time was: ' + (totalReqTime / this.serverResData.length).toFixed(2) + ' MilliSeconds\n\n';
    stats += testData;
    fs.writeFile('./testResults/test-' + this.testStartedTime + '.txt', stats, (err) => {
      if (err) 
        throw err;
      console.log('\nTest Done.\nResults logged into "test-' + this.testStartedTime + '.txt"\n')
    });
  }


  getTimeFormat = (time) => {
    var testTime = new Date(time).getMonth() + '/' + new Date(time).getDate() + '/' + new Date(time).getYear();
    testTime += ', ' + new Date(time).getHours() + ':' + new Date(time).getMinutes();
    testTime += ':' + new Date(time).getSeconds() + ':' + new Date(time).getMilliseconds()
    return testTime
  }
};