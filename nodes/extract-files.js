const GET = require('./common/docker-get');

const buildPath = function (msg, config) {
  const id = msg.payload.container || config.container;
  const query = require('querystring').stringify({
    path: msg.payload.path || config.path
  });

  return `/containers/${id}/archive?${query}`;
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
  payload.tar = data;
  payload.time = new Date();

  node.send({
    _msgid: msg._msgid,
    payload: payload
  });
};

module.exports = GET('extract-files', buildPath, onData, onSuccess);