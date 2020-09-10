const GET = require('./common/docker-get');

const buildPath = function (msg) {
  const container = msg.payload.container;

  if ((typeof container !== 'string') || container === '') {
    node.error("'container' needs to be specified using 'msg' or 'config'");
    return;
  }

  const query = require('querystring').stringify({
    size: true
  });

  return `/containers/${container}/json?${query}`;
}

const onData = function () {
  const result = function (chunk) {
    if ((typeof chunk === 'string') && chunk !== '') {
      node.trace(chunk);
      
      result.accumulator += chunk
    }
    return result.accumulator;
  };

  result.accumulator = "";

  return result;
};

const onSuccess = function (msg, node, data) {
  const payload = Object.assign({}, msg.payload);
  payload.container_info = JSON.parse(data);
  payload.time = new Date();

  node.send({
    _msgid: msg._msgid,
    payload: payload
  });
};

const onFailure = function (msg, node, data) {
  node.error(data);
};

module.exports = GET('inspect-container', buildPath, onData, onSuccess, onFailure);