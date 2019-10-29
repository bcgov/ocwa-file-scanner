# ocwa-file-scanner

Integrates with OCWA for managing bulk scanning of files.

In OCWA 2.0.0, policies by name were introduced due to differences in the import and export rules.

File scanning has two scenarios:

1) Batch job run as part of the gitlab-runner.  Executes: `src/index.js`.

Batch jobs are run for exporting and for importing.  So it needs to determine which one it is.

2) Real-time scan run as part of the pre-receive hook.  Calls the api: `/api/v1/upload`.

Real-time scans are always done from the perspective of export as they are only run on repositories that are inside the SAE.  So 'export-code' will always be the policy.

## Getting Started


```

docker build --tag ocwa-file-scanner .

```

## Running upload scanning

```
docker run -vi --rm --net=ocwa_vnet -p 5000:3000 -v `pwd`/config.json:/app/config/default.json --name ocwa-file-scanner ocwa-file-scanner npm start

curl -v http://localhost:5000/api/v1/upload -X POST -H "Authorization: Api-Key 582AUpdU6gyJHZGWzciseHwqjc170b" -d 'filename=Dockerfile' -d 'file=@./Dockerfile'

curl -v http://localhost:5000/api/v1/results -X POST -H "Authorization: Api-Key 582AUpdU6gyJHZGWzciseHwqjc170b" -d 'filenames=Dockerfile' -d 'frequency=10000'

```


## Running recursive scan

```
docker run -vi --rm --net=ocwa_vnet -v `pwd`:/work -v `pwd`/config.json:/app/config/default.json ocwa-file-scanner ocwa-scanner /work
```