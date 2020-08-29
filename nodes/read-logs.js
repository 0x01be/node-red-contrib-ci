const GET = require('./common/docker-get');

const buildPath = function (msg, config) {
  const query = require('querystring').stringify({
    stdout: true,
    stderr: config.stderr,
    follow: true,
    details: false,
    timestamps: false,
    tail: 'all'
  });

  return `/containers/${msg.payload.container}/logs?${query}`;
}

const onData = function (node, msg) {

  const result = function (chunk) {
    // cf. https://docs.docker.com/engine/api/v1.40/#operation/ContainerAttach
    // If "Tty": false in create-container.js => chunk.slice(8);
    node.send({
      payload: {
        commit: msg.payload.commit,
        repository: msg.payload.repository,
        image: msg.payload.image,
        container: msg.payload.container,
        stream: chunk,
        time: new Date()
      }
    });
  };

  return result;
};

module.exports = GET('read-logs', buildPath, onData);