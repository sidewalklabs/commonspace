
### Frontend and Expo
#### Installation

``` bash
cd expo_project
yarn
```

#### Running

``` bash
expo-cli start
```


### SQL

#### Local Development
[Install packer][2]

``` bash
cd deployment
packer build postgres.json
docker run -p 5432:5432 swl-eng/gehl-data-collector:v0.0.1 postgres
psql -f deployment/init.sql
```

#### GCP development
Follow the [instructions][1] to connect to Cloud SQL

``` bash
cloud_sql_proxy -instances=<INSTANCE_CONNECTION_NAME>=tcp:5432 -credential_file=<PATH_TO_KEY_FILE>
```

### Cloud functions
Updating the environment variables used by cloud functions

``` bash
cat $path-to-dotenv-file | sed 's/^/pg./' | xargs firebase functions:config:set
firebase deploy --only functions

```

``` bash
cd /functions/uuid/
yarn run deploy
```



[1]: https://cloud.google.com/sql/docs/postgres/connect-external-app#proxy
[2]: https://www.packer.io/intro/getting-started/install.html
