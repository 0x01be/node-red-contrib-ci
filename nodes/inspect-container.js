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
  const commit = msg.payload.commit;
  const repository = msg.payload.repository;
  const image = msg.payload.image;
  const container = msg.payload.container;

  msg.payload = JSON.parse(data);
  msg.payload.commit = commit;
  msg.payload.repository = repository;
  msg.payload.image = image;
  msg.payload.container = container;
  msg.payload.time = new Date()

  node.send(msg);
};

const onFailure = function () {};

module.exports = GET('inspect-container', buildPath, onData, onSuccess, onFailure);