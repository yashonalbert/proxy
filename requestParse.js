module.exports = requestParse;

let state = 'method';

function requestParse(data, state, requests, cache, key, value) {
  for (let codePoint of data) {
    if (state === 'method') {
      if (codePoint === ' '.charCodeAt(0)) {
        cache.method = Buffer.from(value);
        state = 'urlSchema';
        value = [];
        continue;
      }
    }
    if (state === 'urlSchema') {
      if (value.includes('/'.charCodeAt(0))) {
        state = 'urlHostname';
        value = [];
        continue;
      }
    }
    if (state === 'urlHostname') {
      if (codePoint === '/'.charCodeAt(0)) {
        state = 'urlPath';
        value = ['/'.charCodeAt(0)];
        continue;
      }
    }
    if (state === 'urlPath') {
      if (codePoint === ' '.charCodeAt(0)) {
        cache.url = Buffer.from(value);
        state = 'httpVersion';
        value = [];
        continue;
      }
    }
    if (state === 'httpVersion') {
      if (codePoint === '/'.charCodeAt(0)) {
        value = [];
        continue;
      }
      if (codePoint === '\r'.charCodeAt(0)) {
        cache.httpVersion = Buffer.from(value);
        value = [];
        continue;
      }
      if (codePoint === '\n'.charCodeAt(0)) {
        state = 'headersKey';
        continue;
      }
    }
    if (state === 'headersKey') {
      if (codePoint === ':'.charCodeAt(0)) {
        key = Buffer.from(value).toString()
        if (key === 'Proxy-Connection') {
          key = 'Connection';
        }
        cache.rawHeaders.push(Buffer.from(key));
        key = key.toLowerCase();
      }
      if (codePoint === ' '.charCodeAt(0)) {
        if (value.includes(':'.charCodeAt(0))) {
          state = 'headersValue';
          value = [];
          continue;
        }
        requests.push(cache);
        cache = {
          rawHeaders: [],
          headers: {},
        };
        cache.method = Buffer.from(value);
        state = 'urlSchema';
        continue;
      }
      if (codePoint === '\n'.charCodeAt(0)) {
        if (cache.method.toString() === 'GET') {
          requests.push(cache);
          cache = {
            rawHeaders: [],
            headers: {},
          };
          state = 'method';
          value = [];
        } else {
          state = 'body';
          value = [];
        }
        continue;
      }
    }
    if (state === 'headersValue') {
      if (codePoint === '\r'.charCodeAt(0)) {
        cache.rawHeaders.push(Buffer.from(value));
        cache.headers[key] = Buffer.from(value);
        key = '';
        value = [];
        continue;
      }
      if (codePoint === '\n'.charCodeAt(0)) {
        state = 'headersKey';
        continue;
      }
    }
    if (state === 'body') {
      if (codePoint === '\r'.charCodeAt(0)) {
        cache.body = Buffer.from(value);
        value = [];
        continue;
      }
      if (codePoint === '\n'.charCodeAt(0)) {
        requests.push(cache);
        cache = {
          rawHeaders: [],
          headers: {},
        };
        state = 'method';
        continue;
      }
    }
    value.push(codePoint);
  }
  return { state, requests, cache, key, value };
}
