import React from 'react';
import { Alert, Image, Text, TextInput, TouchableHighlight, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import BackArrow from '../components/BackArrow';
import SharedGradient from '../components/SharedGradient';
import { WebBrowser } from 'expo';
import { sendPasswordResetEmail } from '../lib/commonsClient';
import authStyles from '../stylesheets/auth';
import urls from '../config/urls';
import color from 'color';

class ForgotPasswordScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    headerLeft: <BackArrow goBack={navigation.goBack} />,
  });

  constructor(props) {
    super(props);
    this.state = {
      fetching: false,
      email: props.navigation.state.params.email,
    };
  }

  _resetPassword = async () => {
    const { email } = this.state;
    try {
      this.setState({ fetching: true });
      await sendPasswordResetEmail(email);
      Alert.alert(
        'Password reset email sent!',
        'Check your email in a few minutes for instructions.',
        [{ text: 'OK' }],
      );
    } catch (error) {
      Alert.alert(error.name, error.message, [{ text: 'OK' }]);
    }
    this.setState({ fetching: false });
  };

  _openLink = async uri => {
    return await WebBrowser.openBrowserAsync(uri);
  };

  render() {
    return (
      <SharedGradient style={authStyles.container}>
        <Image source={require('../assets/images/CSIcon_36_white.png')} style={authStyles.logo} />
        <View style={authStyles.content}>
          <Text style={authStyles.title}>{`Reset\nPassword`}</Text>
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
          </View>
          <TouchableHighlight
            disabled={this.state.fetching}
            style={[authStyles.cta, authStyles.primaryCta]}
            underlayColor={color('#ffcf2b').darken(0.2)}
            onPress={this._resetPassword}>
            <Text style={[authStyles.ctaCopy, authStyles.primaryCtaCopy]}>Reset Password</Text>
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

export default withNavigation(ForgotPasswordScreen);
