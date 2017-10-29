const net = require('net');

const HOST = '127.0.0.1';
const PORT = 6969;

class HTTPParser {
  constructor() {
    this.setStatus('method');
    this.on('http', () => {});
    this.data = Buffer.from([]);
    this.request = {
        method: undefined,
        url: undefined,
        version: undefined,
        headers: {},
    }
  }

  on(event, callback) {
    if (event === 'request') { this.requestCallback = callback; }
    if (event === 'body') { this.bodyCallback = callback; }
  }

  setStatus(status) {
    if (this.status === undefined && status === 'method') return this.status = 'method';
    if (this.status === 'method' && status === 'url') return this.status = 'url';
    if (this.status === 'url' && status === 'version') return  this.status = 'version';
    if (this.status === 'version' && status === 'headersKey') return  this.status = 'headersKey';
    if (this.status === 'headersKey' && status === 'headersValue') return this.status = 'headersValue';
    if (this.status === 'headersValue' && status === 'headersKey') return this.status = 'headersKey';
    if (this.status === 'headersKey' && status === 'method') return this.status = 'method';
    if (this.status === 'headersKey' && status === 'body') return this.status = 'body';
    if (this.status === 'body' && status === 'method') return this.status = 'method';
    throw (new Error('illegal status'));
  }

  parse(data) {
    this.data = Buffer.concat([this.data, data], this.data.length + data.length);

    let readFrom = 0;
    let key = undefined;
    for (let readTo = 0; readTo < this.data.length; readTo++) {
      if (this.status === 'method' && this.data[readTo] === ' '.charCodeAt(0)) {
        this.request.method = this.data.slice(readFrom, readTo);
        this.setStatus('url');
        readFrom = readTo + 1;
        continue;
      }
      if (this.status === 'url' && this.data[readTo] === ' '.charCodeAt(0)) {
        this.request.url = this.data.slice(readFrom, readTo);
        this.setStatus('version');
        readFrom = readTo + 1;
        continue;
      }
      if (this.status === 'version' && this.data[readTo] === '\r'.charCodeAt(0)) {
        this.request.version = this.data.slice(readFrom, readTo);
        this.setStatus('headersKey');
        readFrom = readTo + 2;
        continue;
      }
      if (this.status === 'headersKey' && this.data[readTo] === ':'.charCodeAt(0)) {
        key = this.data.slice(readFrom, readTo).toString().toLowerCase();
        this.setStatus('headersValue');
        readFrom = readTo + 2;
        continue;
      }
      if (this.status === 'headersValue' && this.data[readTo] === '\r'.charCodeAt(0)) {
        this.request.headers[key] = this.data.slice(readFrom, readTo);
        this.setStatus('headersKey');
        readFrom = readTo + 2;
        continue;
      }
      if (this.status === 'headersKey' && this.data[readTo] === '\r'.charCodeAt(0)) {
        const request = this.data;
        this.requestCallback(this.request.headers.host, conn => conn.write(request.slice(0, readTo + 2)));
        if (this.request.method.toString() === 'GET') {
          this.setStatus('method');
          readFrom = readTo + 2;
          break;
        }
        if (this.request.method.toString() === 'POST') {
          this.setStatus('body');
          readFrom = readTo + 2;
          continue;
        }
      }
      if (this.status === 'body') {
        // if (this.request.headers['transfer-encoding']) {
        //   this.chunked = 0;
        //   if (this.chunked === 0) {
        //     if (this.data[readTo] === '\r'.charCodeAt(0)) {
        //       this.chunked = parseInt(this.data.slice(readFrom, readTo).toString(), 16);
        //       readFrom = readTo + 2;
        //     }
        //   }
        //   if (readTo === readFrom + this.chunked) {

        //   }

        // } else
        if (this.request.headers['content-length']) {
          if (readTo === readFrom + Number(this.request.headers['content-length'].toString()) - 1) {
            this.request.body = this.data.slice(readFrom, readTo + 1);
            this.setStatus('method');
            readFrom = readTo + 3;
            break;
          }
        } else {
          throw (new Error('illegal body'));
        }
      }
    }
    this.data = this.data.slice(readFrom);
  }
}

net.createServer(function (socket) {
  let parser = new HTTPParser();
  let conn = new net.Socket();
  let client = false;
  parser.on('request', (host, callback) => {
    console.log(client)
    if (!client) {
      const port = host.toString().includes(':') ? Number(host.toString().split(':').pop()) : 80;
      const hostname = (port === 80)
        ? host.toString() : (host.toString().split(':').shift() === 'localhost')
          ? '127.0.0.1' : host.toString().split(':').shift();
      conn.connect(port, hostname, () => {
        console.log('CONNECTED TO: ' + hostname + ':' + port);
        client = true;
        callback(conn);
      });
    } else {
      callback(conn);
    }
  })
  parser.on('body', (callback) => {
  })
  // .on('error', () => {
  // });
  socket.on('data', parser.parse.bind(parser));
  conn.on('data', (data) => socket.write(data));
  conn.on('close', () => {
    client = false;
    console.log('close')
  });
}).listen(PORT, HOST, () => console.log('Server listening on ' + HOST + ':' + PORT));

