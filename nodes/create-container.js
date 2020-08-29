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
      const request = require(docker.protocol).request({
        hostname: docker.hostname,
        port: docker.port,
        path: buildPath(msg),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, function (response) {
        response.setEncoding('utf8');

        let message = undefined;

        response.on('data', function (chunk) {
          if ((typeof chunk === 'string') && chunk !== '') {
            try { message = JSON.parse(chunk); } catch (_) {}
          }
        });

        response.on('end', function () {
          const success = response.complete && (response.statusCode === 201) 
                        && message && (typeof message.Id === 'string') && (message.Id !== '');
          
          if (success) {
            node.send({
              payload: {
                commit: msg.payload.commit,
                repository: msg.payload.repository,
                image: msg.payload.image,
                container: message.Id,
                time: new Date()
              }
            });
          }
        });
      });

      const image = ((typeof msg.payload.image === 'string') && msg.payload.image !== '') ? msg.payload.image : config.image;

      request.write(`{"Tty":true,"Image":"${image}"}`);
      request.end();
    });
  }

  RED.nodes.registerType('create-container', CreateContainerNode);
}