const net = require('net');
const ReqHandel = require('./reqHandel');

const HOST = '127.0.0.1';
const PORT = 6969;

net.createServer(function (sock) {
  sock.reqHandel = new ReqHandel();
  console.log('Server connected: ' + sock.remoteAddress + ':' + sock.remotePort);
  sock.on('data', function (reqData) {
    console.log(reqData.toString())
    sock.reqHandel.requestParse(reqData)
    sock.reqHandel.client.on('data', function (resData) {
      console.log(resData.toString())
      // sock.write(resData);
    });
  });
  sock.reqHandel.client.on('close', function () {
    console.log('Client connection closed');
  });
  sock.on('end', function () {
    console.log('end')
  });
  sock.on('close', function (data) {
    console.log('Server closed: ' + sock.remoteAddress + ' ' + sock.remotePort);
  });
}).listen(PORT, HOST, () => console.log('Server listening on ' + HOST + ':' + PORT));


// function log(data) {
//   let a = ''
//   for (let b of data) {
//     a = a + ',' + b
//   }
//   return a
// }
