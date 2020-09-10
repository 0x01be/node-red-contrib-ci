module.exports = function (RED) {
   function CreateWorkspaceNode (config) {
    const node = this;
    const docker = RED.nodes.getNode(config.docker);

    RED.nodes.createNode(this, config);

    node.on('input', function (msg) {
      const request = require(docker.protocol).request({
        hostname: docker.hostname,
        port: docker.port,
        path: '/volumes/create',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, function (response) {
        response.setEncoding('utf8');

        response.on('error', node.error);

        let output = "";
        let message = undefined;

        response.on('data', function (chunk) {
          if ((typeof chunk === 'string') && chunk !== '') {
            node.trace(chunk);

            output += chunk;

            try {
              message = JSON.parse(chunk)
            } catch (error) {
              node.error(error);
              node.error(chunk);
            }
          }
        });

        response.on('end', function () {
          const success = response.complete && (response.statusCode === 201)
                          && message;

          if (success) {
            const payload = Object.assign({}, msg.payload);
            payload.workspace = message;
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

      const build = msg.payload.build || msg._msgid;
      const name = ((typeof build === 'string') && build !== '') ? build: undefined;

      request.write(JSON.stringify({
        Name: name,
        Driver: 'local'
      }));
      request.end();
    });
  }

  RED.nodes.registerType('create-workspace', CreateWorkspaceNode);
}