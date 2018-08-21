
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

### Admin App
There are really basic html forms that allow a user to interact and experiment with firestore.
It's a simple static website, with javascript form index.js, and html in index.html. Use your
favorite http server from the root directory.

``` bash
python -m http.server
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
Fillout the provided templates in the config directory and rename the files to not include -template.
run the following commands to set up enviroment variables, and deploy the functions to your firebase
cloud instance.

``` bash
cat config/firebase-gcp.yml | sed 's/^/gcp./' | sed 's/: /=/' | xargs firebase functions:config:set
cat config/firebase-gmail.yml | sed 's/^/email./' | sed 's/: /=/' | xargs firebase functions:config:set
firebase deploy --only functions

```

``` bash
cd /functions/uuid/
yarn run deploy
```



[1]: https://cloud.google.com/sql/docs/postgres/connect-external-app#proxy
[2]: https://www.packer.io/intro/getting-started/install.html
