module.exports = function (RED) {
  RED.nodes.registerType('start-container', require('./common/docker-start-stop')(RED, 'start'));
}