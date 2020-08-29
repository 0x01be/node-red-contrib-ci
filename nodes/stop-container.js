module.exports = function (RED) {
  RED.nodes.registerType('stop-container', require('./common/docker-start-stop')(RED, 'stop'));
}