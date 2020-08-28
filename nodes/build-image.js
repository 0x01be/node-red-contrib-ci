module.exports = function (RED) {

  function buildPath (msg, config) {
    const remote = ((typeof msg.payload.remote === 'string') && msg.payload.remote !== '') ? msg.payload.remote : config.remote;
    const nocache = ((typeof msg.payload.nocache === 'string') && msg.payload.nocache !== '') ? msg.payload.nocache : config.nocache;
    const pull = ((typeof msg.payload.pull === 'string') && msg.payload.pull !== '') ? msg.payload.pull : config.pull;

    const query = require('querystring').stringify({
      remote: remote,
      q: false,
      rm: true,
      forcerm: true,
      nocache: nocache,
      pull: pull
    });

    return `/build?${query}`;
  }

  function isSuccessful (response, image) {
    const result = response.complete && (response.statusCode === 200) 
                && (typeof image === 'string') && (image !== '');
                
    return result;
  }

  function BuildImageNode (config) {
    const node = this;
    const docker = RED.nodes.getNode(config.docker);
    
    RED.nodes.createNode(this, config);

    node.on('input', function (msg) {
      const request = require(docker.protocol).request({
        hostname: docker.hostname,
        port: docker.port,
        path: buildPath(msg, config),
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-tar',
          'Content-Length': 0
        }
      }, function (response) {
        response.setEncoding('utf8');

        let result = undefined;

        response.on('data', function (chunk) {
          if (chunk && chunk !== '') {
            try {
              const message = JSON.parse(chunk);

              if (message.aux && (typeof message.aux.ID === 'string') && message.aux.ID.startsWith('sha256:')) {
                result = message.aux.ID.slice(7);
              }
  
              // Status messages are ignored
              if (message.stream) {
                msg.payload = {
                  commit: msg.payload.commit,
                  repository: msg.payload.repository,
                  stream: message.stream,
                  time: new Date()
                };

                node.send([null, msg]);
              }
            } catch (_) {}
          }
        });

        response.on('end', function () {
          if (isSuccessful(response, result)) {
            msg.payload = {
              commit: msg.payload.commit,
              repository: msg.payload.repository,
              image: result,
              time: new Date()
            };

            node.send([msg, null]);
          }
        });
      });

      request.end();
    });
  }

  RED.nodes.registerType('build-image', BuildImageNode);
}