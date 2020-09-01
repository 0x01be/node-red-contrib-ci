module.exports = function (RED) {
  function DockerStartStop (config) {
    const node = this;
    const docker = RED.nodes.getNode(config.docker);
    const operation = config.operation;

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

        response.on('data', function (chunk) {
          node.debug(chunk);
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
                time: new Date()
            }});
          }
        });
      });

      request.end();
    });
  }
  
  RED.nodes.registerType('start-stop-container', DockerStartStop);
}