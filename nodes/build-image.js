module.exports = (RED) => {

  const buildPath = (msg, config) => {
    const remote = ((typeof msg.payload.remote === 'string') && msg.payload.remote !== '') ? msg.payload.remote : config.remote;
    const nocache = ((typeof msg.payload.nocache === 'string') && msg.payload.nocache !== '') ? msg.payload.nocache : config.nocache;
    const pull = ((typeof msg.payload.pull === 'string') && msg.payload.pull !== '') ? msg.payload.pull : config.pull;

    const query = require('querystring').stringify({
      remote: remote,
      dockerfile: undefined,
      q: false,
      rm: true,
      forcerm: true,
      nocache: nocache,
      pull: pull
    });

    return `/build?${query}`;
  }

  const isSuccessful = (response, image) => {
    const result = response.complete && (response.statusCode === 200) 
                && image && (typeof image.Id === 'string') && (image.Id !== '');
                
    return result;
  }

  function BuildImageNode (config) {
    const node = this;

    RED.nodes.createNode(this, config);

    node.on('input', (msg) => {
      const request = require(config.protocol).request({
        hostname: config.hostname,
        port: config.port,
        path: buildPath(msg, config),
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-tar',
          'Content-Length': 0
        }
      }, (response) => {
        response.setEncoding('utf8');

        const log = [];
        log.full = () => {
          return log.reduce((accumulator, value) => {
            return `${accumulator}${value}`;
          }, "");
        };

        let image = undefined;

        response.on('data', (chunk) => {
          if (chunk && chunk !== '') {
            // Always JSON
            const message = JSON.parse(chunk);

            if (message.aux && (typeof message.aux.ID === 'string') && message.aux.ID.startsWith('sha256:')) {
              image = {
                Id: message.aux.ID.slice(7)
              };
            }

            // Status messages are ignored
            if (message.stream) {
              log.push(message.stream);

              node.send([null, {
                payload: {
                  stream: message.stream,
                  log: log.full()
                }
              }]);
            }
          }
        });

        response.on('end', () => {
          const success = isSuccessful(response, image);

          if (success) {
            node.send([{
              payload: image
            }, null]);
          }
        });
      });

      request.end();
    });
  }

  RED.nodes.registerType('build-image', BuildImageNode);
}