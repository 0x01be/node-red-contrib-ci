FROM nodered/node-red:1.1.3-12-minimal

RUN npm install \
    @elastic/elasticsearch \
    node-red-contrib-spreadsheet-in \
    node-red-contrib-wait-paths \
    node-red-node-email \
    node-red-dashboard \
    node-red-node-swagger \
    node-red-node-ui-table \
    node-red-contrib-ui-svg \
    node-red-contrib-ui-level \
    git+https://github.com/0x01be/node-red-contrib-ci.git

EXPOSE 1880
