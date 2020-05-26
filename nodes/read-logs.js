const GET = require('./common/docker-get');

const buildPath = (msg, config) => {
  const id = msg.payload.Id;
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

  const result = (chunk) => {
    // cf. https://docs.docker.com/engine/api/v1.40/#operation/ContainerAttach
    const line = chunk.slice(8);

    node.send({
      payload: {
        stream: line
      }
    });
  };

  return result;
};

module.exports = GET('read-logs', buildPath, onData);