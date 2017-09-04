const net = require('net');
const requestParse = require('./requestParse');

const HOST = '127.0.0.1';
const PORT = 6969;

net.createServer(function(sock) {
  console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
  sock.on('data', function (data) {
    const req = requestParse(data);
    const client = new net.Socket();
    client.connect(80, req.headers.host.toString(), function() {
      console.log('CONNECTED TO: ' + req.headers.host.toString() );
      client.write(data);
    });
    client.on('data', function(data) {
      sock.write(data);
    sock.destroy();
      client.destroy();
    });
    client.on('close', function() {
      console.log('Connection closed');
    });
  });
  sock.on('close', function (data) {
    console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
  });
}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);
