cat config/cloud.env | sed 's/=/: /' > .env.yml
cd functions
tsc
cd -
gcloud beta functions deploy newUserSaveToPostgres --runtime nodejs8 --env-vars-file .env.yml
