const GET = require('./common/docker-get');

const buildPath = function (msg) {
  const id = msg.payload.container;
  const query = require('querystring').stringify({
    size: true
  });

  return `/containers/${id}/json?${query}`;
}

const onData = function () {
  const result = function (chunk) {
    return result.accumulator += chunk;
  };

  result.accumulator = "";

  return result;
};

const onSuccess = function (msg, node, data) {
  const payload = Object.assign({}, msg.payload);
  payload.info = JSON.parse(data);
  payload.time = new Date();

  node.send({
    _msgid: msg._msgid,
    payload: payload
  });
};

module.exports = GET('inspect-container', buildPath, onData, onSuccess);