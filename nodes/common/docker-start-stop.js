module.exports = function DockerStartStop (RED, operation)  {
  if (operation !== 'start' && operation !== 'stop') return function () {};

  return function (config) {
    const node = this;
    const docker = RED.nodes.getNode(config.docker);

    RED.nodes.createNode(this, config);

    node.on('input', function (msg) {
      const path = `/containers/${msg.payload.container}/${operation}`;
      
      const request = require(docker.protocol).request({
        hostname: docker.hostname,
        port: docker.port,
        path: path,
        method: 'POST'
      }, function (response) {
        response.setEncoding('utf8');

        let message = undefined;

        response.on('data', function (chunk) {
          if ((typeof chunk === 'string') && chunk !== '') {
            try {
              message = JSON.parse(chunk);
            } catch (_) {}
          }
        });

        response.on('end', function () {
          const success = response.complete && (response.statusCode === 204);
          
          if (success) {
            node.send({
              payload: {
                commit: msg.payload.commit,
                repository: msg.payload.repository,
                image: msg.payload.image,
                container: msg.payload.container,
                info: message,
                time: new Date()
            }});
          } else {
            node.error(JSON.stringify(message, null, 2));
          }
        });
      });

      request.end();
    });
  }
}