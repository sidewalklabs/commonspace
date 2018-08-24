
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

#### Local Development -- Backend
[Install packer][2]

``` bash
cd deployment
packer build postgres.json
docker run -p 5431:5431 swl-eng/gehl-data-collector:v0.0.1 postgres
psql -f deployment/init.sql
```

#### Integration testing
The gcp cloud functions interact with Postgreql. If you're a reasonable human being you want to check the simple stuff really quickly without deploying
everyting to the cloud. In the spirit of this, load the sql into a docker container running postgres and test the functions that interact with postgres.

First link the .env file:

``` bash
ln -s config/development.env .env
```

Start a new environment, currently must be done for each run of a set of test :(
``` bash
cd deployment && ./develop.sh
```

In order to run test, the jest binary must be available to the execution environment.
``` bash
yarn run test
```

#### GCP development
Follow the [instructions][1] to connect to Cloud SQL

``` bash
cloud_sql_proxy -instances=<INSTANCE_CONNECTION_NAME>=tcp:5432 -credential_file=<PATH_TO_KEY_FILE>
```

##### Deploying SQL changes
Once the cloud sql proxy is running.

``` bash
psql "host=127.0.0.1 sslmode=disable dbname=postgres user=postgres" -f deployment/reset.sql
psql "host=127.0.0.1 sslmode=disable dbname=postgres user=postgres" -f deployment/init.sql
```


## Deploy GCP Cloud Functions
Create an environment variables file.

``` bash
cat gehl-921be-firebase-adminsdk-46n9l-0d6437a6d4.json | node json_to_string.js | sed 's/^/gcp.serviceaccountkey=/' | firebase functions:config:set
firebase functions:config:set $(cat gehl-921be-firebase-adminsdk-46n9l-0d6437a6d4.json)
cat gehl-921be-firebase-adminsdk-46n9l-0d6437a6d4.json | node json_to_string.js | sed 's/^/gcp.serviceaccountkey=/' | firebase functions:config:set
ln -s
```

### Firebase Cloud functions
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
