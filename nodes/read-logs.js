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
  let previousTime = new Date();

  const result = function (chunk) {
    node.trace(chunk);
    
    // TODO FIX!!
    // Needed to avoid identical timestamps on consecutive events
    let newTime = new Date();
    while (previousTime.getTime() === newTime.getTime()) newTime = new Date();
    previousTime = newTime;

    const payload = Object.assign({}, msg.payload);
    payload.workspace = undefined;
    payload.stream = chunk;
    payload.time = newTime;

    // cf. https://docs.docker.com/engine/api/v1.40/#operation/ContainerAttach
    // If "Tty": false in create-container.js => chunk.slice(8);
    node.send({
      _msgid: msg._msgid,
      payload: payload
    });
  };

  return result;
};

module.exports = GET('read-logs', buildPath, onData);