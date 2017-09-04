module.exports = requestParse;

function requestParse(data) {
  const request = {
    headers: {},
  };
  let state = 'method';
  let key = '';
  let value = [];
  for (let codePoint of data) {
    if (state === 'method') {
      if (codePoint === 32) {
        request.method = Buffer.from(value);
        state = 'url';
        value = [];
        continue;
      }
    }
    if (state === 'url') {
      if (codePoint === 32) {
        request.url = Buffer.from(value);
        state = 'httpVersion';
        value = [];
        continue;
      }
    }
    if (state === 'httpVersion') {
      if (codePoint === 47) {
        value = [];
        continue;
      }
      if (codePoint === 13) {
        request.httpVersion = Buffer.from(value);
        value = [];
        continue;
      }
      if (codePoint === 10) {
        state = 'headersKey';
        continue;
      }
    }
    if (state === 'headersKey') {
      if (codePoint === 58) {
        key = Buffer.from(value).toString().toLowerCase();
        continue;
      }
      if (codePoint === 32) {
        state = 'headersValue';
        value = [];
        continue;
      }
      if (codePoint === 10) {
        state = 'body';
        value = [];
        continue;
      }
    }
    if (state === 'headersValue') {
      if (codePoint === 13) {
        request.headers[key] = Buffer.from(value);
        key = '';
        value = [];
        continue;
      }
      if (codePoint === 10) {
        state = 'headersKey';
        continue;
      }
    }
    if (state === 'body') {
      if (codePoint === 13) {
        request.body = Buffer.from(value);
        continue;
      }
    }
    value.push(codePoint);
  }
  return request;
}


