module.exports = function (RED) {

  function DockerConfigNode (config) {
    this.protocol = config.protocol;
    this.hostname = config.hostname;
    this.port = config.port;

    RED.nodes.createNode(this, config);  
  }

  RED.nodes.registerType("docker-config", DockerConfigNode);
}