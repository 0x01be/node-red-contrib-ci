module.exports = function (RED) {

  const buildPath = function (msg, config) {
    const query = require('querystring').stringify({
      name: msg.payload.hostname || config.hostname
    });

    return `/containers/create?${query}`;
  }

  function CreateContainerNode (config) {
    const node = this;
    const docker = RED.nodes.getNode(config.docker);

    RED.nodes.createNode(this, config);

    node.on('input', function (msg) {
      const image = msg.payload.image;

      if ((typeof image !== 'string') || image === '') {
        node.error("'image' needs to be specified using 'msg' or 'config'");
        return;
      }

      const path = buildPath(msg, config);

      const request = require(docker.protocol).request({
        hostname: docker.hostname,
        port: docker.port,
        path: path,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, function (response) {
        response.setEncoding('utf8');

        response.on('error', node.error);

        let output = "";
        let message = undefined;

        response.on('data', function (chunk) {
          if ((typeof chunk === 'string') && chunk !== '') {
            node.trace(chunk);

            output += chunk;
            try {
              message = JSON.parse(chunk)
            } catch (error) {
              node.error(error);
              node.error(chunk);
            }
          }
        });

        response.on('end', function () {
          const success = response.complete && (response.statusCode === 201)
                          && message
                          && (typeof message.Id === 'string')
                          && message.Id !== '';
                        
          if (success) {
            const payload = Object.assign({}, msg.payload);
            payload.container = message.Id.substring(0, 12);
            payload.time = new Date();

            node.send({
              _msgid: msg._msgid,
              payload: payload
            });
          } else {
            node.error(`${path} [${response.statusCode}]`);
            node.error(output);
          }
        });
      });

      const binds = [];
      if (config.workspace
          && msg.payload.workspace
          && msg.payload.workspace.Name) {
        binds.push(`${msg.payload.workspace.Name}:${config.workspace}:rw,z`);
      }

      let cmd = [];
      try {
        if ((typeof msg.payload.cmd === 'string') && (msg.payload.cmd !== '')) {
          cmd = JSON.parse(msg.payload.cmd);
        } else if ((typeof config.cmd === 'string') && (config.cmd !== '')) {
          cmd = JSON.parse(config.cmd);
        }
      } catch (error) {
        node.error(value);
      }

      let env = [];
      try {
        if ((typeof msg.payload.env === 'string') && (msg.payload.env !== '')) {
          env = JSON.parse(msg.payload.env);
        } else if ((typeof config.env === 'string') && (config.env !== '')) {
          env = JSON.parse(config.env);
        }
      } catch (error) {
        node.error(value);
      }

      const body = {
        Tty: true,
        Image: image,
        Cmd: cmd,
        Env: env,
        HostConfig: {
          Binds: binds,
        }
      }
      
      body.Hostname = msg.payload.hostname || config.hostname;
      body.Domainname = msg.payload.domain;
      body.HostConfig.PortBindings = msg.payload.ports;

      request.write(JSON.stringify(body));
      request.end();
    });
  }

  RED.nodes.registerType('create-container', CreateContainerNode);
}
