const _ = require('lodash');
const net = require('net');
const requestParse = require('./requestParse');
const requestBufferify = require('./requestBufferify');

class ReqHandel {
  constructor() {
    this.client = new net.Socket();
    this.queueState = false;
    this.requests = [];
    this.cache = {
      rawHeaders: [],
      headers: {},
    };
    this.state = 'method';
    this.key = '';
    this.value = [];
  }

  requestParse(reqData) {
    const parse = requestParse(reqData, this.state, this.requests, this.cache, this.key, this.value);
    this.state = parse.state;
    this.requests = parse.requests;
    this.cache = parse.cache;
    this.key = parse.key;
    this.value = parse.value;
    if (!this.queueState) {
      this.queueState = true;
      this.connectQueue();
    }
  }

  requestBufferify(data) {
    return requestBufferify(data);
  }

  connectQueue() {
    const that = this;
    if (this.requests.length > 0) {
      this.host = _.first(this.requests).headers.host;
      const port = this.host.toString().includes(':') ? Number(_.last(this.host.toString().split(':'))) : 80;
      const hostname = this.host.toString().includes(':')
        ? (_.first(this.host.toString().split(':')) === 'localhost')
          ? '127.0.0.1'
          : _.first(this.host.toString().split(':'))
        : this.host.toString();
      this.client.connect(port, hostname, function () {
        console.log('Connected to: ' + that.host.toString());
        that.requestQueue();
      });
    } else {
      this.queueState = false;
      return;
    }
  }

  requestQueue() {
    const that = this;
    if (!_.first(that.requests).headers.host.equals(that.host)) {
      that.host = _.first(that.requests).headers.host
      that.queueState = true;
      that.connectQueue();
    } else {
      that.client.write(requestBufferify(_.first(that.requests)));
      that.requests.shift();
      setTimeout(function () {
        if (that.requests.length > 0) {
          // console.log(that.requests);
          that.requestQueue();
        } else {
          that.queueState = false;
        }
      }, 500);
    }
  }
}

module.exports = ReqHandel;
