module.exports = function (RED) {

  const buildPath = function (msg, config) {
    const container = msg.payload.container;
    const v = Boolean(msg.payload.v || config.v);
    const force = Boolean(msg.payload.force || config.force);
    const link = Boolean(msg.payload.link || config.link);
    const query = require('querystring').stringify({
      v: v,
      force: force,
      link: link
    });

    return `/containers/${container}?${query}`;
  }

   function RemoveContainerNode (config) {
    const node = this;
    const docker = RED.nodes.getNode(config.docker);

    RED.nodes.createNode(this, config);

    node.on('input', function (msg) {
      const request = require(docker.protocol).request({
        hostname: docker.hostname,
        port: docker.port,
        path: buildPath(msg, config),
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      }, function (response) {
        response.on('error', node.error);
      });

      request.end();
    });
  }

  RED.nodes.registerType('remove-container', RemoveContainerNode);
}