FROM nodered/node-red:1.1.2-12-minimal

USER root
RUN apk --no-cache add git 

USER node-red
RUN npm install node-red-dashboard node-red-node-swagger && git clone https://github.com/0x01be/node-red-docker.git /data

