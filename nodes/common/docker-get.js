module.exports = function DockerGet (name, buildPath, onData, onSuccess, onFailure) {

  function isSuccessful (response) {
    return response.complete && (response.statusCode === 200);
  }

  return function (RED) {

    function DockerGetNode (config) {
      const node = this;
      const docker = RED.nodes.getNode(config.docker);
      const protocol = require(docker.protocol);

      RED.nodes.createNode(this, config);

      node.on('input', function (msg) {
        const path = buildPath(msg, config);

        protocol.get({
          hostname: docker.hostname,
          port: docker.port,
          path: path
        }, function (response) {
          const onChunk = (typeof onData === 'function') ? onData(node, msg) : function () {};
          response.setEncoding('utf8');
          response.on('data', onChunk);
          response.on('end', function () {
            if (isSuccessful(response)) {
              if (typeof onSuccess === 'function') {
                onSuccess(msg, node, onChunk.accumulator);
              }
            } else if (typeof onFailure === 'function') {
              onFailure(msg, node, onChunk.accumulator);
            }
          });
        });
      });
    }

    RED.nodes.registerType(name, DockerGetNode);
  };
}