FROM nodered/node-red:latest-12-minimal

VOLUME /data

COPY *.* /data/
COPY /static/ /data/static/
COPY /nodes/ /data/nodes/

RUN npm install node-red-dashboard node-red-node-swagger

EXPOSE 1880
