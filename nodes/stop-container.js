module.exports = function (RED) {
  const StopContainerNode = require('./common/docker-start-stop')(RED, 'stop');

  RED.nodes.registerType('stop-container', StopContainerNode);
}