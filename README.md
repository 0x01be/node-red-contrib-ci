# node-red-docker

![screenshot](./screenshot.png)

- Build images
- Create, start, stop and inspect containers
- Index logs and events in elasticsearch

## Use

| Component     | URL |
| ------------- | --- |
| Editor        | http://localhost:1880/edit |
| Git           | http://localhost:3000/ |
| Dashboard     | http://localhost:5601/ |

### Start elasticsearch and kibana for indexing and dashboarding

```
docker run --name elasticsearch -d -p 127.0.0.1:9200:9200 -p 127.0.0.1:9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.9.0
docker run --name kibana -d -p 127.0.0.1:5601:5601 --link elasticsearch:elasticsearch docker.elastic.co/kibana/kibana:7.9.0 ; docker logs -g elasticsearch kibana
```

### Expose the docker unix socket on port 2375 if necessary

`docker run --name docker -d --restart always -v /var/run/docker.sock:/var/run/docker.sock -p 2375:1234 dimdm/simple-docker-proxy`

### Start Node-RED

`docker run --name ci -d -v $(pwd):/data -p 127.0.0.1:1880:1880 --link docker:docker --link elasticsearch:elasticsearch 0x01be/node-red-docker`

### Start Gitea

`docker run  --name git -v $(pwd)/gitea:/data -p 127.0.0.1:3000:3000 --link ci:ci gitea/gitea`
