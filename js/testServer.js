
const queryString = require('querystring');
const http = require('http');
const fs = require('fs');


class responseData {
  constructor(reqIndex, statusCode, sentTime, receivedTime, concurency, errMsg) {
    this.reqId = (Number((Math.random() * 10000).toFixed(0)) * 100000) + reqIndex
    this.status = statusCode;
    this.sentTime = sentTime;
    this.receivedTime = receivedTime;
    this.concurency = concurency;
    this.errorMsg = errMsg;
  }
}


module.exports.serverTests = class serverTests {
  constructor(requestedData, serverResponse) {
    this.reqData = requestedData;
    this.res = serverResponse;
    this.serverResData = [];
    this.totalReq = 0;
    this.testStartedTime = 0;
    this.testEndedAt = 0;
    this.reqDtls = this.reqData['reqDtls'];
    this.asyncRequests = {'totalSyncReq': 0, 'reqClusters': 0};
  }

  getTestResult = () => {
    this.testStartedTime = new Date().getTime();
    var initTime = (this.testStartedTime / 1000).toFixed(0);
    this.getInitialReqFreq();
    
    var reqTimer = setInterval(() => {
      var elapsedTime = (new Date().getTime() / 1000).toFixed(0) - initTime;
      this.showTestStatus(elapsedTime);
      if (this.reqDtls.reqFreq.timeSec > elapsedTime) {
        if (this.reqDtls.case == 3 || this.reqDtls.case == 2)
          this.getReqDtlsAsync();
        for (var i = 0; i < this.reqDtls.reqFreq.asyncReq; i++) {
          this.sendRequest();
        }
      } else {
        clearInterval(reqTimer);
        this.testEndedAt = new Date().getTime();
        this.logResults();
      }
    }, this.reqDtls.reqFreq.reqFreq);
  }
  
  
  sendRequest = () => {
    var reqSentAt = new Date().getTime();
    var concurency = this.reqDtls.reqFreq.asyncReq;
    this.totalReq++;
    const req = http.get(this.getServerParams(), (res) => {
      res.on('data', (data) => {
        var reqReceivedAt = new Date().getTime();
        var resData = new responseData(this.totalReq, res.statusCode, reqSentAt, reqReceivedAt, concurency, '');
        this.serverResData.push(resData);
      });
    });
    req.on('error', (e) => {
      var reqReceivedAt = new Date().getTime();
      var err = e.message;
      var resData = new responseData(this.totalReq, this.getErrorCode(e), reqSentAt, reqReceivedAt, concurency, err);
      this.serverResData.push(resData);
    });
  }


  showTestStatus = (elapsedTime) => {
    var percReqSent = (elapsedTime * 100 / this.reqDtls.reqFreq.timeSec).toFixed(1);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write( 'Running Performance Test..\t' + percReqSent + '%\t');
  }


  getErrorCode = (e) => {
    if (e.errno == 'ETIMEDOUT')
      return 408;
    else
      return 500;
  }
  
  
  getServerParams = () => {
    var phoneNumber = '07' + ((Math.random() + 8) * 10000000).toFixed(0)
    var path = this.reqData.opts.path +  '?msisdn=' + phoneNumber + '&input=114&newRequest=1'
    return 'http://' + this.reqData.opts.host + ':' + this.reqData.opts.port + path;
  }
  
  
  getInitialReqFreq = () => {
    if (this.reqDtls.case == 1) {
      this.reqDtls.reqFreq.asyncReq = 1;
      this.asyncRequests['totalSyncReq'] = this.reqDtls.reqFreq.reqPerMin;
      this.asyncRequests['reqClusters'] = this.reqDtls.reqFreq.reqPerMin;
    } else if (this.reqDtls.case == 3) {
      var asyncReq = (this.reqDtls.reqFreq.minAsyncReq + this.reqDtls.reqFreq.maxAsyncReq) / 2;
      this.reqDtls.reqFreq.reqFreq = (60 * 1000 * asyncReq) / this.reqDtls.reqFreq.reqPerMin
    }
  }
  
  
  getReqDtlsAsync = () => {
    if (this.reqDtls.case == 3) {
      var minAsyncReq = this.reqDtls.reqFreq.minAsyncReq; //Remember to adjust this as the test goes on
      var maxAsyncReq = this.reqDtls.reqFreq.maxAsyncReq; //Remember to adjust this as the test goes on
      this.reqDtls.reqFreq.asyncReq = Math.floor(Math.random() * (maxAsyncReq - minAsyncReq)) + minAsyncReq;
    }
    this.asyncRequests['totalSyncReq'] += this.reqDtls.reqFreq.asyncReq;
    this.asyncRequests['reqClusters'] += 1;
  }


  logResults = () => {
    var logPath = './testResults/', logReqPath = logPath + 'requests details/'
    var [summary, details] = this.getLogData();
    fs.writeFile(logPath + 'test-' + this.testStartedTime + '.txt', summary, (err) => {
      if (err) throw err;
      console.log('\nTest Done.\nResults logged into "' + logPath + 'test-' + this.testStartedTime + '.txt"')
    });
    if (this.reqDtls.logRequests) {
      fs.writeFile(logReqPath + 'testReqs-' + this.testStartedTime + '.txt', details, (err) => {
        if (err) throw err;
        console.log('Requests details logged into "' + logReqPath + 'testReqs-' + this.testStartedTime + '.txt"\n')
      });
    }
  }


  getLogData = () => {
    var [reqData, successReq, failedReq, totalReqTime] = this.getReqDetailsLog();
    var summary = this.getTestSummary(totalReqTime, successReq, failedReq);
    var parameters = this.getReqParamLog();
    return [parameters + summary, parameters + summary + reqData];
  }


  getReqParamLog = () => {
    if (this.reqDtls.case == 3)
      this.reqDtls.reqFreq.asyncReq = this.asyncRequests['totalSyncReq'] / this.asyncRequests['reqClusters'];
    var reqParams = 'Test Category: Perfomance Test\n';
    reqParams += 'case(scenario): ' + this.reqDtls.case + '\n';
    reqParams += 'Test duration: ' + this.reqDtls.reqFreq.timeSec + ' Seconds\n';
    reqParams += 'Requests per minute: ' + this.reqDtls.reqFreq.reqPerMin + '\n';
    reqParams += 'Asynchronous requests: ' + (this.reqDtls.reqFreq.asyncReq).toFixed(1) + '\n';
    reqParams += 'Asynchronous requests clusters: ' + this.asyncRequests['reqClusters'] + '\n';
    reqParams += 'Minimum asynchronous requests: ' + this.reqDtls.reqFreq.minAsyncReq + '\n';
    reqParams += 'Maximum asynchronous requests: ' + this.reqDtls.reqFreq.maxAsyncReq + '\n';
    reqParams += 'Server address: ' + this.reqData.opts.host + '\n';
    reqParams += 'Server port: ' + this.reqData.opts.port + '\n';
    reqParams += 'Request URL path: ' + this.reqData.opts.path + '\n';
    reqParams += 'Request method: ' + this.reqData.opts.method + '\n';
    reqParams += 'Individual requests details logged: ' + this.reqDtls.logRequests + '\n\n';
    return reqParams;
  }


  getTestSummary = (totalReqTime, successReq, failedReq) => {
    var totalRequests = this.serverResData.length;
    var stats = 'Test performed At: ' + new Date(this.testStartedTime) + '\n';
    stats += 'Test ended At: ' + new Date(this.testEndedAt) + '\n';
    stats += 'Test lasted for: ' + String(this.testEndedAt - this.testStartedTime) + ' MilliSeconds\n';
    stats += 'Sent request: ' + this.totalReq + '\n';
    stats += 'Received request: ' + totalRequests + '\n';
    stats += 'Successful request(returned a 200 status code): ' + successReq + '\n';
    stats += 'Failed request: ' + failedReq + '\n';
    stats += 'Average Response Time was: ' + (totalReqTime / totalRequests).toFixed(2) + ' MilliSeconds\n\n';
    return stats;
  }


  getReqDetailsLog = () => {
    var totalReqTime = 0, successReq = 0, failedReq = 0, avgAsyncReq = 0, reqData = '';
    this.serverResData.forEach((value, index, array) => {
      var reqResTime = value.receivedTime - value.sentTime;
      totalReqTime += reqResTime;
      reqData += (index + 1) + '.)\t- Request sent at: ' + this.getTimeFormat(value.sentTime) + '\n';
      reqData += '\t- Response received at: ' + this.getTimeFormat(value.receivedTime) + '\n';
      reqData += '\t- Request(s) sent simultaneously: ' + value.concurency + '\n';
      reqData += '\t- Request response Time: ' + reqResTime + ' MilliSeconds\n';
      reqData += '\t- Request response status code: ' + value.status + ' \n';
      reqData += (value.status != 200) ? '\t- Request error message: ' + value.errorMsg + ' \n\n': '\n\n';
      successReq += (value.status == 200) ? 1 : 0
      failedReq += (value.status != 200) ? 1 : 0
    });
    return [reqData, successReq, failedReq, totalReqTime];
  }


  getTimeFormat = (time) => {
    var testTime = new Date(time).getMonth() + '/' + new Date(time).getDate() + '/' + new Date(time).getYear();
    testTime += ', ' + new Date(time).getHours() + ':' + new Date(time).getMinutes();
    testTime += ':' + new Date(time).getSeconds() + ':' + new Date(time).getMilliseconds()
    return testTime
  }
};