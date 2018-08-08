

### Cloud SQL

#### Local Development
[Install packer][2]

``` bash
cd deployment
packer build postgres.json
docker run -p 5432:5432 swl-eng/gehl-data-collector:v0.0.1 postgres
```

#### GCP development
Follow the [instructions][1] to connect to Cloud SQL

``` bash
cloud_sql_proxy -instances=<INSTANCE_CONNECTION_NAME>=tcp:5432 -credential_file=<PATH_TO_KEY_FILE>
```

### Deployment
#### Cloud functions
Updating the environment variables used by cloud functions

``` bash
cat $path-to-dotenv-file | sed 's/^/pg./' | xargs firebase functions:config:set

```

``` bash
gcloud beta functions --runtime nodejs8--env-vars-file .env.yaml 
```



[1]: https://cloud.google.com/sql/docs/postgres/connect-external-app#proxy
[2]: https://www.packer.io/intro/getting-started/install.html
