const GET = require('./common/docker-get');

const buildPath = (msg, config) => {
  const id = ((typeof msg.payload.Id === 'string') && (msg.payload.Id !== '')) ? msg.payload.Id : config.container;

  return `/containers/${id}/json`;
}

const onData = () => {
  const result = (chunk) => {
    return result.result += chunk;
  };

  result.result = "";

  return result;
};

const onSuccess = (node, data) => {
  node.send({
    payload: JSON.parse(data)
  });
};

const onFailure = () => {};

module.exports = GET('inspect-container', buildPath, onData, onSuccess, onFailure);