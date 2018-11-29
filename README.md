## Running the Administrator Frontend and API Server Locally on Kubernetes
[Kubernetes] is an open source project designed to automate the deployent, scaling, and management of cloud based applications. Commons uses kubernetes to run in the cloud. Various cloud services provide support for running and monitoring applications in a kubernetes environment. In order to test out and debug issues related to prodution environments developers should run commons using [minikube], which allows developers to run kubernetes environments on a single machine. Follow the appropriate install [instructions](minikube-install-instrutions) for your machine. Once installed you can use the following command line instructions to run Commons in a cloud-like environment. Note before running the application in kubernetes, [we will need access to an appropriate postgres instance] (## Setting Up Postgres) 

``` bash
minikube start
eval $(minikube docker-env)
packer build -var version=$(git rev-parse --short=8 HEAD) -var container_image_name=swl-eng/commons-nginx deployment/commons_nginx.json
packer build -var version=$(git rev-parse --short=8 HEAD) -var container_image_name=swl-eng/commons-server deployment/commons_server.json
kubectl patch --local -o yaml -p \ '
              {
                "spec": {
                   "template": {
                        "spec": {
                          "containers": [
                                {
                                    "name": "commons-nginx",
                                    "image": "swl-eng/commons-nginx:'$(git rev-parse --short=8 HEAD)'"
                                },
                                {
                                    "name": "commons-server",
                                    "image": "swl-eng/commons-server:'$(git rev-parse --short=8 HEAD)'"
                                }
                            ]
                        }
                    }
                  }
              }' -f deployment/commons.yml > deployment/commons.yml
kubectl apply -f development-postgres-endpoint.yml
kubectl apply -f commons.yml
kubectl apply -f commons_nginx_service.yml
kubectl apply -f commons_ingress.yml
```

N.B.
Don't forget to turn off your minikube when you're all done, you probably could have guessed:
``` bash
minikube stop
```

### Frontend and Expo
#### Installation
Install postgres
linux

``` bash
sudo apt-get install libpq-dev
```

``` bash
brew install postgres
```

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
[Install Packer]

``` bash
cd deployment
packer build postgres.json
docker run -p 5431:5431 swl-eng/commons-postgres:$(../.version) postgres -p 5431
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

## Setting Up Postgres

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
[Install Packer]: https://www.packer.io/intro/getting-started/install.html
[kubernetes]: https://kubernetes.io/
[minikube]: https://github.com/kubernetes/minikube
[minikube-install-instrutions]: https://kubernetes.io/docs/tasks/tools/install-minikube/
