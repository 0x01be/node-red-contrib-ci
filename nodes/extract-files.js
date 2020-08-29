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
  node.send({
    payload: {
      commit: msg.payload.commit,
      repository: msg.payload.repository,
      image: msg.payload.image,
      container: msg.payload.container,
      tar: data,
      time: new Date()
  }});
};

module.exports = GET('extract-files', buildPath, onData, onSuccess);