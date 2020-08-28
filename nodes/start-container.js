module.exports = function (RED) {
  const StartContainerNode = require('./common/docker-start-stop')(RED, 'start');

  RED.nodes.registerType('start-container', StartContainerNode);
}