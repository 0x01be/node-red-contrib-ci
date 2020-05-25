# node-red-docker

## Run

### Docker socket on port 1234 with socat
`docker run -d --rm --name proxy -p 1234:1234 -v /var/run/docker.sock:/var/run/docker.sock dimdm/simple-docker-proxy`

### Gogs on over HTTP on port 3000
`docker run -d --rm --name=gogs -p 3000:3000 -v $(pwd)/gogs:/data gogs/gogs`

### Node-RED over HTTP on port 1880
`docker build . -t node-red-docker && docker run --rm --name node-red-docker -v $(pwd):/data -p 1880:1880 node-red-docker`

[Editor](http://localhost:1880/edit)
[Dashboard](http://localhost:1880/dashboard)
[swagger.json](http://localhost:1880/dashboard)
