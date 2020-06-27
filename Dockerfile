FROM nodered/node-red:latest-12-minimal

USER root
RUN apk --no-cache add git 

USER node-red
RUN npm install node-red-dashboard node-red-node-swagger && git clone https://github.com/0x01be/node-red-docker.git /data

