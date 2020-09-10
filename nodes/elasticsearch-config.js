module.exports = function (RED) {
  const { Client } = require('@elastic/elasticsearch');

  function ElasticsearchConfigNode (config) {
    this.index = config.index;
    this.protocol = config.protocol;
    this.hostname = config.hostname;
    this.port = config.port;
    this.url = `${this.protocol}://${this.hostname}:${this.port}`;
    this.client = new Client({ node: this.url });

    RED.nodes.createNode(this, config);
  }

  RED.nodes.registerType('elasticsearch-config', ElasticsearchConfigNode);
}