import React from 'react';
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NavigationActions, withNavigation } from 'react-navigation';
import { WebBrowser } from 'expo';
import firebase from 'firebase';
import color from 'color';
import BackArrow from '../components/BackArrow';
import SharedGradient from '../components/SharedGradient';
import authStyles from '../stylesheets/auth';
import urls from '../config/urls';

class SignUpWithEmailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    headerLeft: <BackArrow goBack={navigation.goBack} />,
  });

  constructor(props) {
    super(props);
    this.state = {
      fetching: false,
      email: '',
      password: '',
      confirmPassword: '',
    };
  }

  _signUp = async () => {
    const { email, password, confirmPassword } = this.state;
    if (password === confirmPassword) {
      this.setState({ fetching: true });
      try {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        Alert.alert('Verify Email', 'Check email to verify account.', [{ text: 'OK' }]);
        NavigationAtions.navigate('LogInWithEmailScreen');
      } catch ({code, message}) {
        Alert.alert(code, message, [{ text: 'OK' }]);
      }
    } else {
      Alert.alert('Error', 'Password confirmation must match Password', [{ text: 'OK' }]);
    }
    this.setState({ fetching: false });
  };

  _openLink = async uri => WebBrowser.openBrowserAsync(uri);

  render() {
    return (
      <SharedGradient style={authStyles.container}>
        <Image source={require('../assets/images/CSIcon_36_white.png')} style={authStyles.logo} />
        <View style={authStyles.content}>
          <Text style={authStyles.title}>{'Create \nnew account'}</Text>
          <View style={authStyles.formContainer}>
            <TextInput
              style={{ height: 40 }}
              placeholder="Email Address"
              onChangeText={email => this.setState({ email })}
              value={this.state.email}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />
            <TextInput
              style={{ height: 40 }}
              secureTextEntry
              placeholder="Password"
              onChangeText={password => this.setState({ password })}
              value={this.state.password}
              autoCapitalize="none"
              autoCorrect={false}
              clearTextOnFocus
              textContentType="password"
            />
            <TextInput
              style={{ height: 40 }}
              secureTextEntry
              placeholder="Retype Password"
              onChangeText={confirmPassword => this.setState({ confirmPassword })}
              value={this.state.confirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              clearTextOnFocus
              textContentType="password"
            />
          </View>
          <TouchableOpacity
            disabled={this.state.fetching}
            underlayColor={color('#ffcf2b').darken(0.2)}
            style={[authStyles.cta, authStyles.primaryCta]}
            onPress={this._signUp}>
            <Text style={[authStyles.ctaCopy, authStyles.primaryCtaCopy]}>Create Account</Text>
          </TouchableOpacity>
        </View>
        <View style={authStyles.footer}>
          <TouchableOpacity
            style={authStyles.cta}
            underlayColor="#00000010"
            onPress={() => this._openLink(urls.privacy)}>
            <Text style={authStyles.ctaCopy}>Privacy & Terms</Text>
          </TouchableOpacity>
        </View>
      </SharedGradient>
    );
  }
}

export default withNavigation(SignUpWithEmailScreen);
