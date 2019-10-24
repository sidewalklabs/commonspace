import React from 'react';
import { Alert, AsyncStorage, Image, Platform, TouchableHighlight, Text, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { AppAuth, Constants, WebBrowser } from 'expo';
import firebase from 'firebase';
import color from 'color';
import SharedGradient from '../components/SharedGradient';
import authStyles from '../stylesheets/auth';
import urls from '../config/urls';
import { logInUserWithGoogleAccessToken } from '../lib/commonsClient';

const provider = new firebase.auth.GoogleAuthProvider();

class AuthScreen extends React.Component {
  static navigationOptions = {
    headerTitle: '',
    headerLeft: null,
    gesturesEnabled: false,
  };

  _signInWithGoogleAsync = async () => {
    try {
      const {user, token} = await firebase.auth().signInWithPopup(provider);
      console.log(`user: ${user} :: token: ${token}`);
    } catch ({code, message, credential, email}) {
      console.error()
    }

    

    // TODO: switch to Expo's GoogleSignIn component once it's documented and stable
    try {
      // Workaround: OAuthRedirect uses the our bundle id redirect back to the app, but gets confused with mixed case
      // First use string interpolation to flatten, since OAuthRedirect is an array on iOS, and a string on android.
      const lowercaseRedirect = `${AppAuth.OAuthRedirect}`.toLowerCase();
      const redirectUrl = `${lowercaseRedirect}:/oauthredirect`;

      const { appOwnership, manifest } = Constants;
      const { googleAuthClientId } = manifest.extra;
      const clientId = googleAuthClientId[appOwnership][Platform.OS];
      const { accessToken } = await AppAuth.authAsync({
        issuer: 'https://accounts.google.com',
        scopes: ['email'],
        redirectUrl,
        clientId,
      });
      // Web login only returns an accessToken so
      // Use it to fetch the same info that native login does.
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await userInfoResponse.json();
      const token = await logInUserWithGoogleAccessToken(accessToken);
      await AsyncStorage.multiSet([
        ['token', token],
        ['googleAccessToken', accessToken],
        ['email', userInfo.email || ''],
      ]);
      this.props.navigation.navigate('App');
    } catch (error) {
      Alert.alert('Error', 'Unabled to sign in. Please try again later.', [{ text: 'OK' }]);
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
            If you are an volunteer or existing organizer, log in to start your study.
          </Text>
          <TouchableHighlight
            style={[authStyles.cta, authStyles.primaryCta]}
            underlayColor={color('#ffcf2b').darken(0.2)}
            onPress={this._signInWithGoogleAsync}>
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
            onPress={() => this.props.navigation.navigate('LogInWithEmailScreen')}>
            <Text style={[authStyles.ctaCopy, { opacity: 1 }]}>Login with Email</Text>
          </TouchableHighlight>
        </View>
        <View style={authStyles.footer}>
          <TouchableHighlight
            underlayColor="#00000010"
            style={authStyles.cta}
            onPress={() => this.props.navigation.navigate('DemoStack')}>
            <Text style={authStyles.ctaCopy}>Try a Demo</Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor="#00000010"
            style={authStyles.cta}
            onPress={() => this._openLink(urls.privacy)}>
            <Text style={authStyles.ctaCopy}>Privacy & Terms</Text>
          </TouchableHighlight>
        </View>
      </SharedGradient>
    );
  }
}

export default withNavigation(AuthScreen);
