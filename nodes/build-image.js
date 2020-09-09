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
      const path = buildPath(msg, config);

      const request = require(docker.protocol).request({
        hostname: docker.hostname,
        port: docker.port,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-tar',
          'Content-Length': 0
        }
      }, function (response) {
        let previousTime = new Date();

        response.setEncoding('utf8');

        response.on('error', node.error);

        let output = "";
        let result = undefined;

        response.on('data', function (chunk) {
          if ((typeof chunk === 'string') && chunk !== '') {
            node.trace(chunk);

            output += chunk;

            // TODO FIX!!
            // Needed to avoid identical timestamps on consecutive events
            let newTime = new Date();
            while (previousTime.getTime() === newTime.getTime()) newTime = new Date();
            previousTime = newTime;

            let message = undefined;

            try {
              message = JSON.parse(chunk);
            } catch (error) {
              node.error(error);
              node.error(chunk);
            }

            if (message && message.aux && (typeof message.aux.ID === 'string') && message.aux.ID.startsWith('sha256:')) {
              result = message.aux.ID.slice(7);
            }

            // Status messages are ignored
            if (message && message.stream) {
              const payload = Object.assign({}, msg.payload);
              payload.image = result && result.substring(0, 12);
              payload.stream = message.stream;
              payload.workspace = undefined;
              payload.time = newTime;

              node.send([null, {
                _msgid: msg._msgid,
                payload: payload
              }]);
            }
            
          }
        });

        response.on('end', function () {
          const success = isSuccessful(response, result);

          if (success) {
            const payload = Object.assign({}, msg.payload);
            payload.image = result.substring(0, 12);
            payload.time = new Date();

            node.send([{
              _msgid: msg._msgid,
              payload: payload
            }, null]);
          } else {
            node.error(`${path} [${response.statusCode}]`);
            node.error(output);
          }
        });
      });

      request.end();
    });
  }

  RED.nodes.registerType('build-image', BuildImageNode);
}