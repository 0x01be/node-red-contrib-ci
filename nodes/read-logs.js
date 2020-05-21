const GET = require('./common/docker-get');

const buildPath = (msg, config) => {
  const id = ((typeof msg.payload.Id === 'string') && (msg.payload.Id !== '')) ? msg.payload.Id : '';

  const query = require('querystring').stringify({
    stdout: true,
    stderr: config.stderr,
    follow: config.follow,
    details: false,
    timestamps: false,
    tail: 'all'
  });

  return `/containers/${id}/logs?${query}`;
}

const onData = (node) => {

  const log = [];
  log.full = () => {
    return log.reduce((accumulator, value) => {
      return `${accumulator}${value}`;
    }, "");
  };

  const result = (chunk) => {
    // cf. https://docs.docker.com/engine/api/v1.40/#operation/ContainerAttach
    const line = chunk.slice(8);

    log.push(line);

    node.send({
      payload: {
        stream: line,
        log: log.full()
      }
    });
  };

  result.log = log;

  return result;
};

const onSuccess = () => {};

const onFailure = () => {};

module.exports = GET('read-logs', buildPath, onData, onSuccess, onFailure);