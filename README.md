# node-red-ci

Continuous Integration with Node RED

## Use

`docker build . -t nodered && docker run --rm --name nodered -v $(pwd):/data -p 1880:1880 nodered`
