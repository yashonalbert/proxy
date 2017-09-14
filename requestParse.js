module.exports = requestParse;

let state = 'method';

function requestParse(data, state, requests, cache, key, value) {
  for (let codePoint of data) {
    if (state === 'method') {
      if (codePoint === 32) {
        cache.method = Buffer.from(value);
        state = 'urlSchema';
        value = [];
        continue;
      }
    }
    if (state === 'urlSchema') {
      if (value.includes(47)) {
        state = 'urlHostname';
        value = [];
        continue;
      }
    }
    if (state === 'urlHostname') {
      if (codePoint === 47) {
        state = 'urlPath';
        value = [47];
        continue;
      }
    }
    if (state === 'urlPath') {
      if (codePoint === 32) {
        cache.url = Buffer.from(value);
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
        cache.httpVersion = Buffer.from(value);
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
        key = Buffer.from(value).toString()
        if (key === 'Proxy-Connection') {
          key = 'Connection';
        }
        cache.rawHeaders.push(Buffer.from(key));
        key = key.toLowerCase();
      }
      if (codePoint === 32) {
        if (value.includes(58)) {
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
      if (codePoint === 10) {
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
      if (codePoint === 13) {
        cache.rawHeaders.push(Buffer.from(value));
        cache.headers[key] = Buffer.from(value);
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
        cache.body = Buffer.from(value);
        value = [];
        continue;
      }
      if (codePoint === 10) {
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
