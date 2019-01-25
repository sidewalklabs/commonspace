import React from 'react';
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Button } from 'react-native-paper';
import SharedGradient from '../components/SharedGradient';
import Theme from '../constants/Theme';
import { Icon, WebBrowser } from 'expo';
import { sendPasswordResetEmail } from '../lib/commonsClient';
import authStyles from '../stylesheets/auth';

class ForgotPasswordScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    headerLeft: (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          navigation.goBack();
        }}
        style={{
          marginLeft: 10,
        }}>
        <Icon.Feather name="arrow-left" size="30" color="white" />
      </TouchableOpacity>
    ),
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
          <Button
            light
            raised
            disabled={this.state.fetching}
            style={authStyles.cta}
            color="#ffcf2b"
            theme={{ ...Theme, roundness: 10 }}
            onPress={this._resetPassword}>
            <Text style={[authStyles.ctaCopy, authStyles.primaryCtaCopy]}>Reset Password</Text>
          </Button>
        </View>
        <View style={authStyles.footer}>
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

export default withNavigation(ForgotPasswordScreen);
