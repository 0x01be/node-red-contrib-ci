module.exports = function (RED) {

  const buildPath = function (msg) {
    const query = ((typeof msg.payload.image === 'string') && msg.payload.image !== '') ? require('querystring').stringify({
      name: undefined
    }) : '';

    return `/containers/create?${query}`;
  }

  function CreateContainerNode (config) {
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
                          && message
                          && (typeof message.Id === 'string')
                          && message.Id !== '';
                        
          if (success) {
            const payload = Object.assign({}, msg.payload);
            payload.container = message.Id.substring(0, 12);
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

      const image = ((typeof msg.payload.image === 'string') && msg.payload.image !== '')
                    ? msg.payload.image
                    : '';

      const Binds = [];
      if (config.workspace
          && msg.payload.workspace
          && msg.payload.workspace.Name) {
        Binds.push(`${msg.payload.workspace.Name}:${config.workspace}:rw,z`);
      }

      request.write(JSON.stringify({
        Tty: true,
        Image: image,
        HostConfig: {
          Binds: Binds
        }
      }));
      request.end();
    });
  }

  RED.nodes.registerType('create-container', CreateContainerNode);
}