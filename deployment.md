# Deploying Commonspace Guide

This guide assumes you have forked the [Sidewalk Labs CommonSpace Repo].

## 1. Create a new database

Follow the instructions at https://cloud.google.com/sql/docs/postgres/create-instance. Once done, use psql and the [cloud sql proxy][1] to establish a connection from your local machine to the newly minted Cloud Sql database. Once your database is up and you've connected via the proxy, use the init.sql script to create the tables used by the application.

```bash
psql -h localhost -p $DB_PORT -U $DB_USER -d $DB_NAME -f deployment/init.sql
```

## 2. [Create a kubernetes cluster][2]

## 3. Configuration

### CircleCi

The CircleCi deployment relies on certain [environment variables][3] being supplied in order to correctly build container images with javascript bundles to run the CommonSpace web server and static assets (what the web browser reads in order to provide a graphical user interface). To figure out what variables need to be included check the bash variables (often of the look "${MY_CIRCLECI_VAR_NAME}", note that some variable may be supplied as defaults by CircleCi) used in the .circelci/config.yml file. There will be two containers built and deployed to Google Cloud Registry (though the packer scripts are easily modifiable to support docker hub and other container registry services[4]), one for the api server and another for the nginx + static asset server. The CircleCi instance in the sidewalk repo contains two deploy jobs. One that gets automatically called for each change to the master branch to a kubernetes cluster called staging, and another that must be manually enabled. Any fork of the repo is likely to require changes in accordance with the name of the kubernetes cluster created in step 2.

### Configuring OAuth

Both the api server and nginx server need the proper OAuth credentials to be able to complete the OAuth protocol[7]. Setup an OAuth consent screen and create a client id and secret in [google cloud console][8]. Make sure to add both the client id and secret to the server's environment if deploying a google oauth route. If using firebase for authentication make sure to configure [following their directions][9]. Add your domain name to the authorized domains of your provider.

### Kubernetes

Create a [secrets configuration][5] yaml in your kubernetes cluster. The kubernetes secret should include all the env variables that are from a secret in the configuration of the "swl-eng/commons-server" container in the deployment/commons.yml kubernetes config and make sure to include all of correct config variables. There are also non-secret env variables that should be created in a [ConfigMap][6]. Similar to the secret configs check the Kubernetes configuration yaml for the latest env variables expected from the ConfigMap.
Note: The nginx + static assets server recieves it's environment variables at run time.

```bash
kubectl apply -f $PATH_TO_SECRETS_FILE
kubectl get secret commonspace-secrets -o yaml
kubectl apply -f $PATH_TO_CONFIG_FILE
kubectl get configMap commons-config -o yaml
kubectl create secret generic cloudsql-commons-credentials --from-file=credentials.json=$PATH_TO_CLOUDSQL_SERVICE_KEY
```

### Firebase

Generate a service account key from Project Settings > Service Accounts > Generate New Private Key. Add the service account json as a base64 encoded string to the kubernetes secret so that the server can interact with the firebase admin SDK.  In order for firebase cloud authentication to work the deployed applications domain name may need to be whitelisted from the firebase console. The data to match up firebase users and the user ids in the database is managed by firebase's firestore which must be manually enabled in the firebase ui. Make sure to enable desired sign-in method and whitelist domains if necessary.

[Setup CircleCi to work with firebase][10].

### Google Cloud DNS

Find the permanent ip of your application and point an A/AAAA record at the ip.

You may need to add your domain name as an authorized domain to any of your AOuth providers - firebase/google/facebook/etc.

[Sidewalk Labs CommonSpace Repo]: https://github.com/sidewalklabs/commonspace
[1]: https://cloud.google.com/sql/docs/postgres/connect-admin-proxy]
[2]: https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-cluster
[3]: https://circleci.com/docs/2.0/env-vars/
[4]: https://www.packer.io/docs/post-processors/docker-push.html
[5]: https://kubernetes.io/docs/concepts/configuration/secret/
[6]: https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/
[7]: https://developers.google.com/identity/protocols/OAuth2
[8]: https://support.google.com/cloud/answer/6158849?hl=en
[9]: https://firebase.google.com/docs/auth/web/google-signin
[10]: https://firebase.google.com/docs/cli
