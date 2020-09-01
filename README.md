# node-red-contrib-ci

![pipeline](https://github.com/0x01be/node-red-contrib-ci/raw/main/pipeline.png)
![dashboard](https://github.com/0x01be/node-red-contrib-ci/raw/main/dashboard.png)

- Build images
- Create, start, stop and inspect containers
- Index logs and events in elasticsearch

## Use

| Component     | URL |
| ------------- | --- |
| Pipeline      | http://localhost:1880/edit |
| Git           | http://localhost:3000/ |
| Dashboard     | http://localhost:5601/ |

## Get started

```
docker run --name es -d -p 127.0.0.1:9200:9200 -p 127.0.0.1:9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.9.0
docker run --name kibana -d -p 127.0.0.1:5601:5601 --link es:elasticsearch docker.elastic.co/kibana/kibana:7.9.0
docker run --name docker -d --restart always -v /var/run/docker.sock:/var/run/docker.sock -p 127.0.0.1:2375:2375 -e PORT=2375 dimdm/simple-docker-proxy
docker run --name ci -d -v $(pwd):/data -p 127.0.0.1:1880:1880 --link docker:docker --link es:elasticsearch 0x01be/node-red-contrib-ci
docker run  --name git -d -v $(pwd)/gitea:/data -p 127.0.0.1:3000:3000 --link ci:ci gitea/gitea
```
