import React from 'react';
import { AsyncStorage, Linking, StyleSheet, Text, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Button, Paragraph, Title } from 'react-native-paper';
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
      const { type, idToken, accessToken } = await Expo.Google.logInAsync({
        androidClientId: '8677857213-avso90qgtscpsfj9cs1r5ri2p9i1nh4q.apps.googleusercontent.com',
        androidStandaloneAppClientId:
          '8677857213-ft2nkhonr0iapgg08r0htbrrco7efnc0.apps.googleusercontent.com',
        iosClientId: '8677857213-j9dn9ebe425td60q8c9tc20gomjbojip.apps.googleusercontent.com',
        iosStandaloneAppClientId:
          '8677857213-s1rosh2e597b3nccpqv67dbfpmc3q53o.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
      });
      if (type === 'success') {
        // Build Firebase credential with the access token.
        const credential = firebase.auth.GoogleAuthProvider.credential(idToken, accessToken);
        // Sign in with credential from the Google user.
        const firebaseSignInResult = await firebase
          .auth()
          .signInAndRetrieveDataWithCredential(credential);

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

  _openEmailDialog = async () => {
    const url = 'mailto:privacy@sidewalklabs.com';
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url).catch(err => {
          console.warn('openURL error', err);
        });
      }
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <Title style={styles.title}>Log in to Public Life Explorer</Title>
        <Paragraph style={styles.paragraph}>
          If you are volunteering to conduct a survey, log in below. Sidewalk Labs, the app
          developer, will only use your information to authenticate you to the app and notify you
          about the studies you have opted into.{' '}
        </Paragraph>
        <Paragraph style={styles.paragraph}>
          View the privacy policy below or email{' '}
          <Text style={{ color: 'blue' }} onPress={this._openEmailDialog}>
            privacy@sidewalklabs.com
          </Text>{' '}
          with any questions about how your personal information is used.
        </Paragraph>
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
    padding: 40,
  },
  title: {
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 20,
  },
  paragraph: {
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default withNavigation(AuthScreen);
