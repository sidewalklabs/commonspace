import React from 'react';
import { Alert, AsyncStorage, Image, Linking, StyleSheet, Text, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Button, Paragraph, Title } from 'react-native-paper';
import Theme from '../constants/Theme';
import { Icon, LinearGradient } from 'expo';
import { WebBrowser } from 'expo';

class AuthScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
  }

  _signIn = async () => {
    try {
      const { type, idToken, accessToken } = await Expo.Google.logInAsync({
        androidClientId: '8677857213-avso90qgtscpsfj9cs1r5ri2p9i1nh4q.apps.googleusercontent.com',
        androidStandaloneAppClientId:
          '8677857213-pp4g0meb9ah2bfbvt851n7u32st7gt14.apps.googleusercontent.com',
        iosClientId: '8677857213-j9dn9ebe425td60q8c9tc20gomjbojip.apps.googleusercontent.com',
        iosStandaloneAppClientId:
          '8677857213-s1rosh2e597b3nccpqv67dbfpmc3q53o.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
      });
      if (type === 'success') {
        const resp = await fetch('https://commons-staging.sidewalklabs.com/auth/google/token', {
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'same-origin',
          redirect: 'follow',
          referrer: 'no-referrer',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'access-token': `${accessToken}`,
          },
        });
        const body = await resp.json();

        console.log(body.token);
        await AsyncStorage.setItem('token', body.token);

        this.props.navigation.navigate('App');
      } else {
        console.log('cancelled');
      }
    } catch (e) {
      console.log('error', e);
      Alert.alert('Error', 'Something went wrong during sign in. Please try again later.', [
        { text: 'OK', onPress: () => {} },
      ]);
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

  _openLink = async uri => {
    return await WebBrowser.openBrowserAsync(uri);
  };

  render() {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0048FF00', '#01C7E0']} style={styles.graddientContainer}>
          <View style={styles.content}>
            <Image source={require('../assets/images/CSIcon_36_white.png')} style={styles.logo} />
            <Title style={styles.title}>Get started with CommonSpace</Title>
            <Paragraph style={styles.paragraph}>
              If you are a volunteer or existing organizer, log in with your google account and
              start your study.
            </Paragraph>
            <Button
              light
              raised
              style={styles.cta}
              color="#ffcf2b"
              theme={{ ...Theme, roundness: 10 }}
              onPress={this._signIn}
              icon={({ size, color }) => (
                <Icon.Ionicons name="logo-google" size={size} color={color} />
              )}>
              <Text style={styles.ctaCopy}>Connect with Google</Text>
            </Button>
            <Button
              dark
              raised
              color="#ffffff20"
              style={styles.cta}
              theme={{ ...Theme, roundness: 10 }}
              onPress={() => this.props.navigation.navigate('DemoStack')}>
              <Text style={styles.ctaCopy}>Try a Demo</Text>
            </Button>
          </View>
          <View style={styles.footer}>
            <Button
              raised
              dark
              color="#ffffff00"
              style={styles.cta}
              theme={{ ...Theme, roundness: 10 }}
              onPress={() => this._openLink('http://www.sidewalktoronto.com/privacy')}>
              <Text style={styles.ctaCopy}>Privacy & Terms</Text>
            </Button>
          </View>
        </LinearGradient>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#008FEE',
  },
  graddientContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    marginBottom: 24,
  },
  cta: {
    padding: 10,
    marginBottom: 10,
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  ctaCopy: {
    fontWeight: 'bold',
    fontSize: 17,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: 'white',
  },
  paragraph: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 24,
    color: 'white',
  },
  footer: {
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },
});

export default withNavigation(AuthScreen);
