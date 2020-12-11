FROM nodered/node-red:1.2.6-12-minimal

RUN npm install \
    node-red-contrib-wait-paths \
    node-red-node-email \
    node-red-dashboard \
    node-red-node-swagger \
    node-red-node-ui-table \
    node-red-contrib-ui-svg \
    git+https://github.com/0x01be/node-red-contrib-ci.git

EXPOSE 1880
