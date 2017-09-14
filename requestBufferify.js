module.exports = requestBufferify;

function requestBufferify(request) {
  const array = []
  for (let codePoint of request.method) {
    array.push(codePoint);
  }
  array.push(32);
  for (let codePoint of request.url) {
    array.push(codePoint);
  }
  array.push(32);
  array.push(72);
  array.push(84);
  array.push(84);
  array.push(80);
  array.push(47);
  for (let codePoint of request.httpVersion) {
    array.push(codePoint);
  }
  array.push(13);
  array.push(10);
  request.rawHeaders.forEach((item, index) => {
    if ( index % 2 === 0 ) {
      for (let codePoint of item) {
        array.push(codePoint);
      }
      array.push(58);
      array.push(32);
    } else {
      for (let codePoint of item) {
        array.push(codePoint);
      }
      array.push(13);
      array.push(10);
      array.push(13);
      array.push(10);
    }
  });
  if (request.body) {
    for (let codePoint of request.body) {
      array.push(codePoint);
    }
    array.push(13);
    array.push(10);
  }
  return Buffer.from(array);
}
