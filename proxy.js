const net = require('net');
const requestParse = require('./requestParse');
const requestBufferify = require('./requestBufferify');

const HOST = '127.0.0.1';
const PORT = 6969;

let queueState = false;
let host;
let requests = [];
let cache = {
  rawHeaders: [],
  headers: {},
};
let state = 'method';
let key = '';
let value = [];

const client = new net.Socket();

net.createServer(function(sock) {
  console.log('Server connected: ' + sock.remoteAddress + ':' + sock.remotePort);
  sock.on('data', function (reqData) {
    console.log(reqData.toString())
    const parse = requestParse(reqData, state, requests, cache, key, value)
    state = parse.state;
    requests = parse.requests;
    cache = parse.cache;
    key = parse.key;
    value = parse.value;
    if (!queueState) {
      queueState = true;
      requestQueue();
    }
  });
  client.on('data', function (resData) {
    sock.write(resData);
  });
  client.on('close', function () {
    console.log('Client connection closed');
  });
  sock.on('end', function () {
    console.log('end')
  });
  sock.on('close', function (data) {
    console.log('Server closed: ' + sock.remoteAddress + ' ' + sock.remotePort);
  });
}).listen(PORT, HOST, () => console.log('Server listening on ' + HOST + ':' + PORT));


function requestQueue() {
  if (requests.length > 0) {
    host = requests[0].headers.host;
    client.connect(80, host.toString(), function() {
      console.log('Connected to: ' + host.toString());
      requests.forEach((request) => {
        if (request.headers.host !== host) {
          host = request.headers.host
        } else {
          requests.shift();
          client.write(requestBufferify(request));
        }
        requestQueue();
      });
    });
  } else {
    queueState = false;
  }
}

