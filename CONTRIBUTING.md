# Contributing
If you're reading this, hooray! We're excited to collaborate with others who are interested in enabling public life studies. Here are some guidelines for contributing.

## Submitting a pull request
We believe in community and welcome pull requests from everyone. But before investing your time in a change, it's best to clear it with the maintainers.

If you want to make a large change that is specific to your use case, we may suggest you maintain your own fork.

## Getting Started
The CommonSpace ecosystem consists of three pieces, all part of this repo.
1. A web-based admin interface for creating and managing public life studies
1. A React Native app for participating in studies
1. A REST API that serves the admin and the app.

### Running the CommonSpace Admin and API
1. Download Packer, Docker and Yarn
* Packer - https://www.packer.io/
* Docker - https://www.docker.com/
* Yarn - https://yarnpkg.com/en/

1. Configure your app 
Fill out the file at development.env, then in your terminal run 
```
ln -s config/development.env .env
```

1. Install Dependencies
```
yarn
```

1. Run the develop script
```
cd /deployment && ./develop.sh
```

1. In another terminal tab, bundle the front end app
```
yarn watch
```

1. In a third tab, run the server
```
ts-node src/server.ts
```

The admin app will be available at http://localhost:3000

### Running the CommonSpace App
1. Download Expo and Yarn
* Expo - https://docs.expo.io/
* Yarn - https://yarnpkg.com/en/

1. Navigate to the expo_project
```
cd expo_project
```
1. Install Dependencies
```
yarn
```

1. Create an app.json file. 
Copy the contents of app.json.example into app.json, and adjust as necessary.
To use Google authentication and Google Maps, you may have to generate your own API keys.
Expo has instructions for generating and storing these keys https://docs.expo.io/versions/latest/sdk/map-view/.

1. Run the app
```
expo start 
```
The Expo CLI interface should run in a browser and offer you the options to run the app in an ios or android emulator if you have one installed, or provide a QR code to run on a device via the Expo app. For more information check out the Expo "up and runnning" guide https://docs.expo.io/versions/latest/workflow/up-and-running/

## License 
CommonSpace is free for anyone to use and modify for any purpose under the Apache 2.0 license.
