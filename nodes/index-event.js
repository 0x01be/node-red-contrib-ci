module.exports = function (RED) {
  function ElasticsearchIndexNode (config) {
    const node = this;
    const elasticsearch = RED.nodes.getNode(config.elasticsearch);
    
    RED.nodes.createNode(this, config);

    node.on('input', function (msg) {
      if (!msg.payload.time) msg.payload.time = new Date();
      
      async function run () {
        await elasticsearch.client.indices.create({
          index: elasticsearch.index,
          body: {
            mappings: {
              properties: {
                source: { type: 'string' },
                event: { type: 'json' }
              }
            }
          }
        }, { ignore: [400] });

        elasticsearch.client.index({
          index: elasticsearch.index,
          op_type: 'create',
          refresh: true,
          body: { event: msg.payload }
        }, function (error, result) {
          if (error) node.error(JSON.stringify(error));
          if (result) node.trace(JSON.stringify(result));
        });
      }
      
      run().catch(node.error)
    });
  }

  RED.nodes.registerType('index-event', ElasticsearchIndexNode);
};