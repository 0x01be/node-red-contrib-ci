FROM nodered/node-red:1.1.3-12-minimal

RUN npm install \
    @elastic/elasticsearch \
    node-red-contrib-re-postgres \
    node-red-contrib-influxdb \
    node-red-contrib-spreadsheet-in \
    node-red-contrib-wait-paths \
    node-red-node-email \
    node-red-dashboard \
    node-red-node-swagger \
    node-red-node-ui-table \
    node-red-contrib-ui-svg \
    node-red-contrib-ui-level
    
