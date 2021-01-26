
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
    this.reqDtls = this.reqData['reqDtls'];
  }

  getTestResult = () => {
    this.testStartedTime = new Date().getTime();
    var initTime = (this.testStartedTime / 1000).toFixed(0);
    this.getReqDtlsFreq();
    
    var reqTimer = setInterval(() => {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      var elapsedTime = (new Date().getTime() / 1000).toFixed(0);
      var percReqSent = ((elapsedTime - initTime) * 100 / this.reqDtls.reqFreq.timeSec).toFixed(1);
      process.stdout.write( 'Running Performance Test..\t' + percReqSent + '%\t');
      if (this.reqDtls.reqFreq.timeSec > elapsedTime - initTime) {
        this.getReqDtlsAsync();
        for (var i = 0; i < this.reqDtls.reqFreq.asyncReq && i < this.reqDtls.reqFreq.minAsyncReq; i++) {
          this.sendRequest();
        }
      } else {
        clearInterval(reqTimer);
        this.logResults();
      }
    }, this.reqDtls.reqFreq.reqFreq);
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
  
  
  getReqDtlsFreq = () => {
    if (this.reqDtls.case == 1) {
      this.reqDtls.reqFreq.asyncReq = 1;
      this.reqDtls.reqFreq.minAsyncReq = 1;
    } else if (this.reqDtls.case == 2) {
      this.reqDtls.reqFreq.reqFreq = (60 * 1000) * this.reqDtls.reqFreq.asyncReq / this.reqDtls.reqFreq.reqPerMin;
      this.reqDtls.reqFreq.asyncReq = 10;
      this.reqDtls.reqFreq.minAsyncReq = 10;
    } else if (this.reqDtls.case == 3) {
      this.reqDtls.reqFreq.minAsyncReq = 1;
      this.reqDtls.reqFreq.asyncReq = Math.floor(Math.random() * 10) + 1;
    }
  }
  
  
  getReqDtlsAsync = () => {
    if (this.reqDtls.case == 1) {
      this.reqDtls.reqFreq.reqPerMin = 100;
    } else if (this.reqDtls.case == 2) {
      this.reqDtls.reqFreq.reqPerMin = 50;
      this.reqDtls.reqFreq.asyncReq = 10;
      this.reqDtls.reqFreq.minAsyncReq = 10;
    } else if (this.reqDtls.case == 3) {
      minAsyncReq = queryString.parse(req)['minAsyncReq'];
      maxAsyncReq = queryString.parse(req)['maxAsyncReq'];
      this.reqDtls.reqFreq.asyncReq = Math.floor(Math.random() * maxAsyncReq) + minAsyncReq;
      if (this.reqDtls.reqFreq.asyncReq < minAsyncReq)
      this.reqDtls.reqFreq.asyncReq = minAsyncReq;
      if (this.reqDtls.reqFreq.asyncReq > maxAsyncReq)
      this.reqDtls.reqFreq.asyncReq = maxAsyncReq;
    }
  }


  logResults = () => {
    var logPath = './testResults/', logReqPath = logPath + 'requests details/'
    var data = this.getLogData();
    fs.writeFile(logPath + 'test-' + this.testStartedTime + '.txt', data['stats'], (err) => {
      if (err) throw err;
      console.log('\nTest Done.\nResults logged into "' + logPath + 'test-' + this.testStartedTime + '.txt"')
    });
    if (this.reqDtls.logRequests) {
      fs.writeFile(logReqPath + 'testReqs-' + this.testStartedTime + '.txt', data['reqData'], (err) => {
        if (err) throw err;
        console.log('Requests details logged into "' + logReqPath + 'testReqs-' + this.testStartedTime + '.txt"\n')
      });
    }
  }


  getLogData = () => {
    var totalReqTime = 0, successReq = 0, failedReq = 0, totalRequests = this.serverResData.length;
    var reqData = '';
    this.serverResData.forEach((value, index, array) => {
      var reqResTime = value.receivedTime - value.sentTime;
      totalReqTime += reqResTime;
      reqData += (index + 1) + '.)\t- Request sent at: ' + this.getTimeFormat(value.sentTime) + '\n';
      reqData += '\t- Response received at: ' + this.getTimeFormat(value.receivedTime) + '\n';
      reqData += '\t- Request response Time: ' + reqResTime + ' MilliSeconds\n';
      reqData += '\t- Request response: ' + value.status + ' \n\n';
      successReq += (value.status == 200) ? 1 : 0
      failedReq += (value.status != 200) ? 1 : 0
    });
    var testEndedAt = new Date().getTime();
    var stats = 'Test performed At: ' + new Date(this.testStartedTime) + '\n';
    stats += 'Test ended At: ' + new Date(testEndedAt) + '\n';
    stats += 'Test lasted for: ' + String(testEndedAt - this.testStartedTime) + ' MilliSeconds\n';
    stats += 'Sent request: ' + this.totalReq + '\n';
    stats += 'Received request: ' + totalRequests + '\n';
    stats += 'Successful request(returned a 200 status code): ' + successReq + '\n';
    stats += 'Failed request: ' + failedReq + '\n';
    stats += 'Average Response Time was: ' + (totalReqTime / totalRequests).toFixed(2) + ' MilliSeconds\n\n';
    return {'stats': stats, 'reqData': stats + reqData};
  }


  getTimeFormat = (time) => {
    var testTime = new Date(time).getMonth() + '/' + new Date(time).getDate() + '/' + new Date(time).getYear();
    testTime += ', ' + new Date(time).getHours() + ':' + new Date(time).getMinutes();
    testTime += ':' + new Date(time).getSeconds() + ':' + new Date(time).getMilliseconds()
    return testTime
  }
};