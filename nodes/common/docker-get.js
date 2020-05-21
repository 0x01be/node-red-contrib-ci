module.exports = (name, buildPath, onData, onSuccess, onFailure) => {

  const isSuccessful = (response) => {
    return response.complete && (response.statusCode === 200);
  }

  return (RED) => {

    function DockerGetNode (config) {
      const node = this;

      RED.nodes.createNode(this, config);

      node.on('input', (msg) => {
        const path = buildPath(msg, config);

        require(config.protocol).get({
          hostname: config.hostname,
          port: config.port,
          path: path
        }, (response) => {
          response.setEncoding('utf8');

          const onChunk = onData(node);

          response.on('data', onChunk);

          response.on('end', () => {
            if (isSuccessful(response)) {
              if (typeof onSuccess === 'function') {
                onSuccess(node, onChunk.accumulator);
              }
            } else if (typeof onFailure === 'function') {
              onFailure(node, onChunk.accumulator);
            }
          });
        });
      });
    }

    RED.nodes.registerType(name, DockerGetNode);
  };
}