module.exports = requestBufferify;

function requestBufferify(request) {
  const array = []
  for (let codePoint of request.method) {
    array.push(codePoint);
  }
  array.push(' '.charCodeAt(0));
  for (let codePoint of request.url) {
    array.push(codePoint);
  }
  array.push(' '.charCodeAt(0));
  array.push('H'.charCodeAt(0));
  array.push('T'.charCodeAt(0));
  array.push('T'.charCodeAt(0));
  array.push('P'.charCodeAt(0));
  array.push('/'.charCodeAt(0));
  for (let codePoint of request.httpVersion) {
    array.push(codePoint);
  }
  array.push('\r'.charCodeAt(0));
  array.push('\n'.charCodeAt(0));
  request.rawHeaders.forEach((item, index) => {
    if ( index % 2 === 0 ) {
      for (let codePoint of item) {
        array.push(codePoint);
      }
      array.push(':'.charCodeAt(0));
      array.push(' '.charCodeAt(0));
    } else {
      for (let codePoint of item) {
        array.push(codePoint);
      }
      array.push('\r'.charCodeAt(0));
      array.push('\n'.charCodeAt(0));
    }
  });
  if (request.body) {
    array.push('\r'.charCodeAt(0));
    array.push('\n'.charCodeAt(0));
    for (let codePoint of request.body) {
      array.push(codePoint);
    }
    array.push('\r'.charCodeAt(0));
    array.push('\n'.charCodeAt(0));
  }
  return Buffer.from(array);
}
