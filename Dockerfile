FROM nodered/node-red:latest-12-minimal

RUN npm install node-red-dashboard node-red-node-swagger

COPY *.* /data/
COPY /nodes/ /data/nodes/

EXPOSE 1880