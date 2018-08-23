import React from "react";
import { Button, Platform, StatusBar, StyleSheet, View } from "react-native";
import { AppLoading, Font, Icon } from "expo";
import AppNavigator from "./navigation/AppNavigator";
import firebase from "./lib/firebaseSingleton";

// todo this.state.userIsAuthenticated = null
export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
    userIsAuthenticated: true
  };

  // https://github.com/hasura/react-native-auth-boilerplate/issues/11
  _signIn = async () => {
    try {
      console.log("start the log ing");
      const { type, idToken, user } = await Expo.Google.logInAsync({
        iosClientId:
          "8677857213-j9dn9ebe425td60q8c9tc20gomjbojip.apps.googleusercontent.com",
        iosStandaloneAppClientId:
          "8677857213-s1rosh2e597b3nccpqv67dbfpmc3q53o.apps.googleusercontent.com",
        scopes: ["profile", "email"]
      });

      if (type === "success") {
        this.setState({
          userIsAuthenticated: true,
          name: user.name,
          photoUrl: user.photoUrl
        });
        // Build Firebase credential with the access token.
        const credential = firebase.auth.GoogleAuthProvider.credential(idToken);
        console.log(`credential: ${credential}`);

        // Sign in with credential from the Facebook user.
        const firebaseSignInResult = await firebase
          .auth()
          .signInAndRetrieveDataWithCredential(credential);
        console.log(`sign in result: ${firebaseSignInResult}`);
      } else {
        console.log("cancelled");
      }
    } catch (e) {
      console.log("error", e);
    }
  };

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <View style={styles.container}>
          {Platform.OS === "ios" && <StatusBar barStyle="light-content" />}
          {this.state.userIsAuthenticated ? (
            <View style={styles.container}>
              <AppNavigator screenProps={{firebase}}/>
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Button
                onPress={this._signIn}
                title="Log In"
                color="green"
                accessibilityLabel="sign in"
              />
            </View>
          )}
        </View>
      );
    }
  }

  _loadResourcesAsync = async () => {
    // This is from the boilerplate. We might not need it
    return Font.loadAsync({
      ...Icon.Ionicons.font,
      monaco: require("./assets/fonts/monaco.ttf")
    });
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  }
});
