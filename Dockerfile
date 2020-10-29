FROM nodered/node-red:1.2.2-12

RUN npm install \
    node-red-contrib-wait-paths \
    node-red-node-email \
    node-red-dashboard \
    node-red-node-swagger \
    node-red-node-ui-table \
    node-red-contrib-ui-svg \
    git+https://github.com/0x01be/node-red-contrib-ci.git#passthrough

EXPOSE 1880
