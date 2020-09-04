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

        response.on('error', node.error);

        response.on('data',  node.debug);

        response.on('end', function () {
          const success = response.complete && (response.statusCode === 204);
          
          if (success) {
            const payload = Object.assign({}, msg.payload);
            payload.time = new Date();

            node.send({
              _msgid: msg._msgid,
              payload: payload
            });
          }
        });
      });

      request.end();
    });
  }
  
  RED.nodes.registerType('start-stop-container', DockerStartStop);
}