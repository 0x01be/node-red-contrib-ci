FROM nodered/node-red:latest-12-minimal

RUN npm install node-red-dashboard node-red-node-swagger

VOLUME /data
EXPOSE 1880

ENTRYPOINT []
CMD [ "/usr/local/bin/node", "node_modules/node-red/red.js", "--userDir", "/data" ]
