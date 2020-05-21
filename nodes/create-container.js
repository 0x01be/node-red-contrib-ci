module.exports = (RED) => {

  const buildPath = (msg) => {
    const query = ((typeof msg.payload.name === 'string') && msg.payload.name !== '') ? require('querystring').stringify({
      name: name
    }) : '';

    return `/containers/create?${query}`;
  }

   function CreateContainerNode (config) {
    const node = this;

    RED.nodes.createNode(this, config);

    node.on('input', (msg) => {
      const request = require(config.protocol).request({
        hostname: config.hostname,
        port: config.port,
        path: buildPath(msg),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, (response) => {
        response.setEncoding('utf8');

        let container = undefined;
        let message = undefined;

        response.on('data', (chunk) => {
          if (chunk && chunk !== '') {
            // Always JSON
            message = JSON.parse(chunk);

            if ((typeof message.Id === 'string') && message.Id !== '') {
              container = {
                Id: message.Id
              };
            }
          }
        });

        response.on('end', () => {
          const success = response.complete && (response.statusCode === 201) 
                        && container && (typeof container.Id === 'string') && container.Id !== '';
          if (success) {
            node.send({
              payload: container
            });
          } else {
            node.send({
              payload: message
            });
          }
        });
      });

      const image = ((typeof msg.payload.Id === 'string') && msg.payload.Id !== '') ? msg.payload.Id : config.image;
      const payload = `{"Image": "${image}"}`;

      request.write(payload);
      request.end();
    });
  }

  RED.nodes.registerType('create-container', CreateContainerNode);
}