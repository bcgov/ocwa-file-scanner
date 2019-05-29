# ocwa-file-scanner

## Getting Started


```

docker build --tag ocwa-file-scanner .

docker run -vi --rm --net=ocwa_vnet -p 4000:3000 -v `pwd`/config.json:/app/config/default.json --name ocwa-file-scanner ocwa-file-scanner npm start

curl -v http://localhost:4000/api/v1/upload -X POST -H "Authorization: Api-Key 582AUpdU6gyJHZGWzciseHwqjc170b" -d 'filename=Dockerfile' -d 'file=@./Dockerfile'

curl -v http://localhost:4000/api/v1/results -X POST -H "Authorization: Api-Key 582AUpdU6gyJHZGWzciseHwqjc170b" -d 'filenames=Dockerfile' -d 'frequency=10000'

```


## Running recursive scan

```
docker run -vi --rm --net=ocwa_vnet -p 4000:3000 -v `pwd`:/work -v `pwd`/config.json:/app/config/default.json ocwa-file-scanner ocwa-scanner /work
```