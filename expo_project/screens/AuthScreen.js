import React from "react";
import { AsyncStorage, StyleSheet, View } from "react-native";
import { withNavigation } from "react-navigation";
import { Button, Subheading, Title } from "react-native-paper";
import Theme from "../constants/Theme";
import { Icon } from "expo";
import firebase from "../lib/firebaseSingleton";

class AuthScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
  }

  _signIn = async () => {
    try {
      console.log("start the log ing");
      const { type, idToken } = await Expo.Google.logInAsync({
        iosClientId:
          "8677857213-j9dn9ebe425td60q8c9tc20gomjbojip.apps.googleusercontent.com",
        iosStandaloneAppClientId:
          "8677857213-s1rosh2e597b3nccpqv67dbfpmc3q53o.apps.googleusercontent.com",
        scopes: ["profile", "email"]
      });

      if (type === "success") {
        // Build Firebase credential with the access token.
        const credential = firebase.auth.GoogleAuthProvider.credential(idToken);
        console.log(`credential: ${credential}`);

        // Sign in with credential from the Facebook user.
        const firebaseSignInResult = await firebase
          .auth()
          .signInAndRetrieveDataWithCredential(credential);
        console.log(`sign in result: ${firebaseSignInResult}`);

        // TODO: Check whether user has access to surveys, and if not add to a waiting list

        // set token for next session, then navigate to the internal app
        await AsyncStorage.setItem("userToken", idToken);
        this.props.navigation.navigate("App");
      } else {
        console.log("cancelled");
      }
    } catch (e) {
      console.log("error", e);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Title style={styles.title}>Create an account</Title>
        <Subheading style={styles.subheading}>
          Once your study is complete, you can use graphs and text to explain
          your findings
        </Subheading>
        <Button
          raised
          primary
          dark
          theme={{ ...Theme, roundness: 100 }}
          onPress={this._signIn}
          icon={({ size, color }) => (
            <Icon.Ionicons name="logo-google" size={size} color={color} />
          )}
        >
          Connect with Google
        </Button>
        <Button
          primary
          onPress={() => this.props.navigation.navigate("PrivacyScreen")}
        >
          Privacy & Terms
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    fontSize: 25,
    marginHorizontal: 50
  },
  subheading: {
    marginHorizontal: 50,
    marginVertical: 30
  }
});

export default withNavigation(AuthScreen);
