# node-red-docker

`docker run -d --rm --name proxy -p 1234:1234 -v /var/run/docker.sock:/var/run/docker.sock dimdm/simple-docker-proxy && docker run -d --rm --name=gogs -p 3000:3000 -v $(pwd)/gogs:/data gogs/gogs`
`docker build . -t node-red-docker && docker run --rm --name node-red-docker -v $(pwd):/data -p 1880:1880 node-red-docker`

| Component     | URL |
| ------------- | --- |
| Editor        | http://localhost:1880/edit |
| Basic UI      | http://localhost:1880/dashboard  |
| API           | http://localhost:1880/http-api/swagger.json |
