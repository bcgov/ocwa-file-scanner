# ocwa-file-scanner

## Getting Started


```

docker build --tag ocwa-file-scanner .

docker run -vi --rm --net=ocwa_vnet -v `pwd`/config.json:/app/config/default.json --name ocwa-file-scanner ocwa-file-scanner npm start

```
