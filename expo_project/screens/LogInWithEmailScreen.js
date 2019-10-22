import React from 'react';
import {
  AsyncStorage,
  Alert,
  Image,
  Text,
  TextInput,
  TouchableHighlight,
  View,
} from 'react-native';
import { withNavigation } from 'react-navigation';
import { WebBrowser } from 'expo';
import firebase from 'firebase';
import color from 'color';
import BackArrow from '../components/BackArrow';
import SharedGradient from '../components/SharedGradient';
import { logInUser } from '../lib/commonsClient';
import authStyles from '../stylesheets/auth';
import urls from '../config/urls';

class LogInWithEmailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    headerLeft: <BackArrow goBack={navigation.goBack} />,
  });

  constructor(props) {
    super(props);
    this.state = {
      fetching: false,
      email: '',
      password: '',
    };
  }

  _login = async () => {
    this.setState({ fetching: true });
    const { email, password } = this.state;
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
    } catch ({code, message}) {
      Alert.alert(code, message, [{ text: 'OK' }]);
    }
    this.setState({ fetching: false });
  };

  _openLink = async uri => WebBrowser.openBrowserAsync(uri);

  render() {
    return (
      <SharedGradient style={authStyles.container}>
        <Image source={require('../assets/images/CSIcon_36_white.png')} style={authStyles.logo} />
        <View style={authStyles.content}>
          <Text style={authStyles.title}>{'Login to \nCommonSpace'}</Text>
          <View style={authStyles.formContainer}>
            <TextInput
              style={{ height: 40 }}
              placeholder="Email Address"
              onChangeText={email => this.setState({ email })}
              value={this.state.text}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />
            <TextInput
              style={{ height: 40 }}
              secureTextEntry
              placeholder="Password"
              onChangeText={password => this.setState({ password })}
              value={this.state.text}
              autoCapitalize="none"
              autoCorrect={false}
              clearTextOnFocus
              textContentType="password"
            />
          </View>
          <TouchableHighlight
            disabled={this.state.fetching}
            underlayColor={color('#ffcf2b').darken(0.2)}
            style={[authStyles.cta, authStyles.primaryCta]}
            onPress={this._login}>
            <Text style={[authStyles.ctaCopy, authStyles.primaryCtaCopy]}>Login</Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor="#00000010"
            style={authStyles.cta}
            onPress={() => this.props.navigation.navigate('SignUpWithEmailScreen')}>
            <Text style={authStyles.ctaCopy}>Create new account</Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor="#00000010"
            style={authStyles.cta}
            onPress={() =>
              this.props.navigation.navigate('ForgotPasswordScreen', { email: this.state.email })
            }>
            <Text style={authStyles.ctaCopy}>Forgot password?</Text>
          </TouchableHighlight>
        </View>
        <View style={authStyles.footer}>
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

export default withNavigation(LogInWithEmailScreen);
