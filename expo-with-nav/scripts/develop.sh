#!/bin/bash

#yolo
yarn build --watch

# Run a server, watching for server and client code changes.
yarn start

# yarn android
yarn ios

# kill any remaining background processes
jobs -p | xargs kill