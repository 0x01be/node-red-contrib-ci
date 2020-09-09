# node-red-contrib-ci

![pipeline](https://github.com/0x01be/node-red-contrib-ci/raw/main/screenshots/pipeline.png)
![dashboard](https://github.com/0x01be/node-red-contrib-ci/raw/main/screenshots/dashboard.png)

- Build, inspect and push images
- Create, start, stop, inspect/stats containers
- Index everything in elasticsearch
- Create dashboards in node-red and kibana
- and more...

## Get started

```
docker run --name docker -d -v /var/run/docker.sock:/var/run/docker.sock:rw -p 127.0.0.1:2375:2375 dimdm/simple-docker-proxy
docker run --name es -d -p 127.0.0.1:9200:9200 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.9.0
docker run --name kibana -d -p 127.0.0.1:5601:5601 --link es:elasticsearch docker.elastic.co/kibana/kibana:7.9.0
docker run --name ci -d -p 127.0.0.1:1880:1880 --link docker:docker --link es:elasticsearch 0x01be/node-red-contrib-ci
docker run --name git -d -p 127.0.0.1:3000:3000 --link ci:ci gitea/gitea
```

## Use

| Component     | URL |
| ------------- | --- |
| Pipeline      | http://localhost:1880/ |
| Git           | http://localhost:3000/ |
| Dashboard     | http://localhost:5601/ |
