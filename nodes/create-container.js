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

        let container = undefined;
        let message = undefined;

        response.on('data', function (chunk) {
          if ((typeof chunk === 'string') && chunk !== '') {
            try {
              message = JSON.parse(chunk);
              message.commit = msg.payload.commit;
              message.repository = msg.payload.repository;
              message.image = msg.payload.image;
              message.time = new Date();

              if ((typeof message.Id === 'string') && message.Id !== '') {
                container = {
                  commit: message.commit,
                  repository: message.repository,
                  image: message.image,
                  container: message.Id,
                  time: message.time
                };
              }
            } catch (_) {}
          }
        });

        response.on('end', function () {
          const success = response.complete && (response.statusCode === 201) 
                        && container && (typeof container.container === 'string') && container.container !== '';

          msg.payload = success ? container : message;

          node.send(msg);
        });
      });

      const image = ((typeof msg.payload.image === 'string') && msg.payload.image !== '') ? msg.payload.image : config.image;

      request.write(`{"Tty":true,"Image":"${image}"}`);
      request.end();
    });
  }

  RED.nodes.registerType('create-container', CreateContainerNode);
}