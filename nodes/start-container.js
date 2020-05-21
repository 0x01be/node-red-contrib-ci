module.exports = (RED) => {

  function StartContainerNode (config)  {
    const node = this;

    RED.nodes.createNode(this, config);

    node.on('input', (msg) => {
      const request = require(config.protocol).request({
        hostname: config.hostname,
        port: config.port,
        path: `/containers/${msg.payload.Id}/start`,
        method: 'POST'
      }, (response) => {
        response.setEncoding('utf8');

        let message = undefined;

        response.on('data', (chunk) => {
          if (chunk && chunk !== '') {
            // Always JSON
            message = JSON.parse(chunk);
          }
        });

        response.on('end', () => {
          const success = response.complete && (response.statusCode === 204);
          if (success) {
            node.send({
              payload: {
                Id: msg.payload.Id
              }
            });
          } else {
            node.send({
              payload: message
            });
          }
        });
      });

      request.end();
    });
  }

  RED.nodes.registerType('start-container', StartContainerNode);
}