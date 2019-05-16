# ocwa-file-scanner

## Getting Started


```

docker build --tag ocwa-file-scanner .

docker run -vi --rm --net=ocwa_vnet -v `pwd`/config.json:/app/config/default.json -p 3333:3000 --name ocwa-file-scanner ocwa-file-scanner npm start

```
