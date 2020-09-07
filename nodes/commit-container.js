module.exports = function (RED) {

  const buildPath = function (msg, config) {
    const query = ((typeof msg.payload.container === 'string') && msg.payload.container !== '') ? require('querystring').stringify({
      container: msg.payload.container,
      repo: msg.payload.repo || config.repo,
      tag: msg.payload.tag || config.tag
    }) : '';

    return `/commit?${query}`;
  }

  function CommitContainerNode (config) {
    const node = this;
    const docker = RED.nodes.getNode(config.docker);

    RED.nodes.createNode(this, config);

    node.on('input', function (msg) {
      const path = buildPath(msg, config);

      const request = require(docker.protocol).request({
        hostname: docker.hostname,
        port: docker.port,
        path: path,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, function (response) {
        response.setEncoding('utf8');

        response.on('error', node.error);

        let output = "";
        let message = undefined;

        response.on('data', function (chunk) {
          node.trace(chunk);

          output += chunk;

          if ((typeof chunk === 'string') && chunk !== '') {
            try {
              message = JSON.parse(chunk)
            } catch (error) {
              node.error(error);
            }
          }
        });

        response.on('end', function () {
          const success = response.complete && (response.statusCode === 201)
                          && message
                          && (typeof message.Id === 'string')
                          && message.Id !== '';

          if (success) {
            const payload = Object.assign({}, msg.payload);
            payload.image = message.Id.slice(7).substring(0, 12);
            payload.repo = payload.repo || config.repo;
            payload.tag = payload.tag || config.tag;
            payload.time = new Date();

            node.send({
              _msgid: msg._msgid,
              payload: payload
            });
          } else {
            node.error(`${path} [${response.statusCode}]`);
            node.error(output);
          }
        });
      });

      request.write(JSON.stringify({}));
      request.end();
    });
  }

  RED.nodes.registerType('commit-container', CommitContainerNode);
}