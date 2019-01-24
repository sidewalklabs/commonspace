import React from 'react';
import { Alert, AsyncStorage, Image, Linking, Text, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Button } from 'react-native-paper';
import SharedGradient from '../components/SharedGradient';
import Theme from '../constants/Theme';
import { WebBrowser } from 'expo';
import authStyles from '../stylesheets/auth';

class AuthScreen extends React.Component {
  static navigationOptions = {
    headerTitle: '',
    headerLeft: null,
    gesturesEnabled: false,
  };

  constructor(props) {
    super(props);
  }

  _signIn = async () => {
    try {
      const { type, user, accessToken } = await Expo.Google.logInAsync({
        androidClientId: '8677857213-avso90qgtscpsfj9cs1r5ri2p9i1nh4q.apps.googleusercontent.com',
        androidStandaloneAppClientId:
          '8677857213-pp4g0meb9ah2bfbvt851n7u32st7gt14.apps.googleusercontent.com',
        iosClientId: '8677857213-j9dn9ebe425td60q8c9tc20gomjbojip.apps.googleusercontent.com',
        iosStandaloneAppClientId:
          '8677857213-s1rosh2e597b3nccpqv67dbfpmc3q53o.apps.googleusercontent.com',
        scopes: ['email'],
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
            'Accept': 'application/bearer.token+json',
            'access-token': `${accessToken}`,
          },
        });
        const body = await resp.json();
        const { email } = user;
        await AsyncStorage.multiSet([['token', body.token], ['email', email]]);
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
      <SharedGradient style={authStyles.container}>
        <Image source={require('../assets/images/CSIcon_36_white.png')} style={authStyles.logo} />
        <View style={authStyles.content}>
          <Text style={authStyles.title}>{`Get started with\nCommonSpace`}</Text>
          <Text style={authStyles.paragraph}>
            If you are a volunteer or existing organizer, log in with your google account and start
            your study.
          </Text>
          <Button
            light
            raised
            style={[authStyles.cta, { marginBottom: 20 }]}
            color="#ffcf2b"
            theme={{ ...Theme, roundness: 10 }}
            onPress={this._signIn}
            icon={require('../assets/images/logo-google.png')}>
            <Text style={[authStyles.ctaCopy, authStyles.primaryCtaCopy]}>Connect with Google</Text>
          </Button>
          <Button
            dark
            raised
            color="#00000010"
            style={authStyles.cta}
            theme={{ ...Theme, roundness: 10 }}
            onPress={() => this.props.navigation.navigate('LogInWithEmailScreen')}>
            <Text style={[authStyles.ctaCopy, authStyles.primaryCtaCopy]}>Login with Email</Text>
          </Button>
        </View>
        <View style={authStyles.footer}>
          <Button
            raised
            dark
            color="#ffffff00"
            style={authStyles.cta}
            theme={{ ...Theme, roundness: 10 }}
            onPress={() => this.props.navigation.navigate('DemoStack')}>
            <Text style={authStyles.ctaCopy}>Try a Demo</Text>
          </Button>
          <Button
            raised
            dark
            color="#ffffff00"
            style={authStyles.cta}
            theme={{ ...Theme, roundness: 10 }}
            onPress={() => this._openLink('http://www.sidewalktoronto.com/privacy')}>
            <Text style={authStyles.ctaCopy}>Privacy & Terms</Text>
          </Button>
        </View>
      </SharedGradient>
    );
  }
}

export default withNavigation(AuthScreen);
