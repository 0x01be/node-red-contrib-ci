module.exports = function (RED) {

  const buildPath = function (msg) {
    const query = require('querystring').stringify({
      tag: msg.payload.tag
    });

    return `/images/${msg.payload.repo}/push?${query}`;
  }

  function PushImageNonde (config) {
    const node = this;
    const docker = RED.nodes.getNode(config.docker);

    RED.nodes.createNode(this, config);

    node.on('input', function (msg) {
      const path = buildPath(msg);

      const request = require(docker.protocol).request({
        hostname: docker.hostname,
        port: docker.port,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': 0,
          'X-Registry-Auth': config.auth
        }
      }, function (response) {
        response.setEncoding('utf8');

        response.on('error', node.error);

        let output = "";

        response.on('data', function (chunk) {
          if ((typeof chunk === 'string') && chunk !== '') {
            node.trace(chunk);

            output += chunk;
          }
        });

        response.on('end', function () {
          const success = response.complete && (response.statusCode === 200);
          if (!success) {
            node.error(`${path} [${response.statusCode}]`);
            node.error(output);
          }
        });
      });

      request.end();
    });
  }

  RED.nodes.registerType('push-image', PushImageNonde);
}