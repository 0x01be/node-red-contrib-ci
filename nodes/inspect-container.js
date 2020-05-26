const GET = require('./common/docker-get');

const buildPath = (msg) => {
  const id = msg.payload.Id;
  const query = require('querystring').stringify({
    size: true
  });

  return `/containers/${id}/json?${query}`;
}

const onData = () => {
  const result = (chunk) => {
    return result.accumulator += chunk;
  };

  result.accumulator = "";

  return result;
};

const onSuccess = (msg, node, data) => {
  msg.payload = JSON.parse(data);

  node.send(msg);
};

const onFailure = () => {};

module.exports = GET('inspect-container', buildPath, onData, onSuccess, onFailure);