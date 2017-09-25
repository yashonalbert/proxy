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
    console.log(parse)
    if (!this.queueState) {
      this.queueState = true;
      this.requestQueue();
    }
  }

  requestBufferify(data) {
    return requestBufferify(data);
  }

  requestQueue() {
    const that = this;
    if (this.requests.length > 0) {
      this.host = _.first(this.requests).headers.host;
      const port = this.host.toString().includes(':') ? Number(_.last(this.host.toString().split(':'))) : 80;
      const hostname = this.host.toString().includes(':')
        ? (_.first(this.host.toString().split(':')) === 'localhost')
          ? '127.0.0.1'
          : _.first(this.host.toString().split(':'))
        : this.host.toString();
      console.log(hostname);
      console.log(port);
      this.client.connect(port, hostname, function () {
        console.log('Connected to: ' + that.host.toString());
        console.log(that.requestBufferify(_.first(that.requests)).toString());
        this.write(that.requestBufferify(_.first(that.requests)));
        // that.requests.shift();
        // this.requests.forEach((request) => {
        //   if (request.headers.host !== this.host) {
        //     this.host = request.headers.host
        //   } else {
        //     this.requests.shift();
        //     console.log(this.requests)
        //     // client.write(requestBufferify(request));
        //   }
        //   requestQueue();
        // });
      });
    } else {
      this.queueState = false;
      console.log(123)
      return;
    }
  }
}

module.exports = ReqHandel;
