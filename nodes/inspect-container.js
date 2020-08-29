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
  node.send({
    payload: {
      commit: msg.payload.commit,
      repository: msg.payload.repository,
      image: msg.payload.image,
      container: msg.payload.container,
      info: JSON.parse(data),
      time: new Date()
  }});
};

module.exports = GET('inspect-container', buildPath, onData, onSuccess);