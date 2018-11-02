docker ps -a | grep swl-eng | awk '{ print $1 }' | xargs docker rm
packer build postgres.json
docker run -p 5431:5431 swl-eng/commons-postgres:v0.0.1 postgres -p 5431
