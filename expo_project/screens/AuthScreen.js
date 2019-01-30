import React from 'react';
import {
  Alert, AsyncStorage, Image, TouchableHighlight, Text, View,
} from 'react-native';
import { withNavigation } from 'react-navigation';
import { WebBrowser } from 'expo';
import color from 'color';
import SharedGradient from '../components/SharedGradient';
import authStyles from '../stylesheets/auth';
import urls from '../config/urls';
import { logInUserWithGoogleAccessToken } from '../lib/commonsClient';

class AuthScreen extends React.Component {
  static navigationOptions = {
    headerTitle: '',
    headerLeft: null,
    gesturesEnabled: false,
  };

  _signIn = async () => {
    try {
      // TODO: should we remove these keys?
      /* eslint-disable no-undef */
      const { user, accessToken } = await Expo.Google.logInAsync({
        androidClientId: '8677857213-avso90qgtscpsfj9cs1r5ri2p9i1nh4q.apps.googleusercontent.com',
        androidStandaloneAppClientId:
          '8677857213-pp4g0meb9ah2bfbvt851n7u32st7gt14.apps.googleusercontent.com',
        iosClientId: '8677857213-j9dn9ebe425td60q8c9tc20gomjbojip.apps.googleusercontent.com',
        iosStandaloneAppClientId:
          '8677857213-s1rosh2e597b3nccpqv67dbfpmc3q53o.apps.googleusercontent.com',
        scopes: ['email'],
      });
      /* eslint-enable no-undef */
      const token = await logInUserWithGoogleAccessToken(accessToken);
      const { email } = user;
      await AsyncStorage.multiSet([['token', token], ['email', email]]);
      this.props.navigation.navigate('App');
    } catch (error) {
      Alert.alert(error.name, error.message, [{ text: 'OK' }]);
    }
  };

  _openLink = async uri => WebBrowser.openBrowserAsync(uri);

  render() {
    return (
      <SharedGradient style={authStyles.container}>
        <Image source={require('../assets/images/CSIcon_36_white.png')} style={authStyles.logo} />
        <View style={authStyles.content}>
          <Text style={authStyles.title}>{'Get started with\nCommonSpace'}</Text>
          <Text style={authStyles.paragraph}>
            If you are a volunteer or existing organizer, log in with your google account and start
            your study.
          </Text>
          <TouchableHighlight
            style={[authStyles.cta, authStyles.primaryCta]}
            underlayColor={color('#ffcf2b').darken(0.2)}
            onPress={this._signIn}
          >
            <View style={authStyles.ctaCopyWrapper}>
              <Image
                style={authStyles.ctaImage}
                source={require('../assets/images/logo-google.png')}
              />
              <Text style={[authStyles.ctaCopy, authStyles.primaryCtaCopy]}>
                Connect with Google
              </Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor="#00000020"
            style={[authStyles.cta, { backgroundColor: '#00000010' }]}
            onPress={() => this.props.navigation.navigate('LogInWithEmailScreen')}
          >
            <Text style={[authStyles.ctaCopy, { opacity: 1 }]}>Login with Email</Text>
          </TouchableHighlight>
        </View>
        <View style={authStyles.footer}>
          <TouchableHighlight
            underlayColor="#00000010"
            style={authStyles.cta}
            onPress={() => this.props.navigation.navigate('DemoStack')}
          >
            <Text style={authStyles.ctaCopy}>Try a Demo</Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor="#00000010"
            style={authStyles.cta}
            onPress={() => this._openLink(urls.privacy)}
          >
            <Text style={authStyles.ctaCopy}>Privacy & Terms</Text>
          </TouchableHighlight>
        </View>
      </SharedGradient>
    );
  }
}

export default withNavigation(AuthScreen);
