import React from 'react';
import { AsyncStorage, StyleSheet, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Button, Subheading, Title } from 'react-native-paper';
import Theme from '../constants/Theme';
import { Icon } from 'expo';
import firebase from '../lib/firebaseSingleton';

class AuthScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
  }

  _signIn = async () => {
    try {
      console.log('start the log ing');
      const { type, idToken } = await Expo.Google.logInAsync({
        iosClientId: '8677857213-j9dn9ebe425td60q8c9tc20gomjbojip.apps.googleusercontent.com',
        iosStandaloneAppClientId:
          '8677857213-s1rosh2e597b3nccpqv67dbfpmc3q53o.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
      });

      if (type === 'success') {
        // Build Firebase credential with the access token.
        const credential = firebase.auth.GoogleAuthProvider.credential(idToken);
        // console.log("credential:", credential);

        // Sign in with credential from the Facebook user.
        const firebaseSignInResult = await firebase
          .auth()
          .signInAndRetrieveDataWithCredential(credential);
        // console.log("sign in result:", firebaseSignInResult);

        // set token for next session, then navigate to the internal app
        await AsyncStorage.setItem('userEmail', firebaseSignInResult.user.email);

        this.props.navigation.navigate('App');
      } else {
        console.log('cancelled');
      }
    } catch (e) {
      console.log('error', e);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Title style={styles.title}>Log in to Commons</Title>
        <Subheading style={styles.subheading}>
          If you are volunteering to conduct a survey, log in below with your email address to get
          started. Sidewalk Labs, the app developer, will only use your information to authenticate
          you to the app notify you about the studies you have opted into. View the privacy policy
          below or email privacy@sidewalklabs.com with any questions about how your personal
          information is used.
        </Subheading>
        <Button
          raised
          primary
          dark
          theme={{ ...Theme, roundness: 100 }}
          onPress={this._signIn}
          icon={({ size, color }) => (
            <Icon.Ionicons name="logo-google" size={size} color={color} />
          )}>
          Connect with Google
        </Button>
        <Button
          primary
          onPress={() =>
            this.props.navigation.navigate('WebViewScreen', {
              uri: 'http://www.sidewalktoronto.com/privacy',
              title: 'Privacy & Terms',
            })
          }>
          Privacy & Terms
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    marginHorizontal: 50,
  },
  subheading: {
    marginHorizontal: 50,
    marginVertical: 30,
  },
});

export default withNavigation(AuthScreen);
