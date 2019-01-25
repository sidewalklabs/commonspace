import React from 'react';
import { AsyncStorage, Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Button } from 'react-native-paper';
import SharedGradient from '../components/SharedGradient';
import Theme from '../constants/Theme';
import { Icon, WebBrowser } from 'expo';
import { signUpUser } from '../lib/commonsClient';
import authStyles from '../stylesheets/auth';

class SignUpWithEmailScreen extends React.Component {
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
      email: '',
      password: '',
      confirmPassword: '',
    };
  }

  _signUp = async () => {
    const { email, password, confirmPassword } = this.state;
    if (password === confirmPassword) {
      try {
        this.setState({ fetching: true });
        const token = await signUpUser(email, password);
        await AsyncStorage.multiSet([['token', token], ['email', email]]);
        this.props.navigation.navigate('App');
      } catch (error) {
        Alert.alert(error.name, error.message, [{ text: 'OK' }]);
      }
    } else {
      Alert.alert('Error', 'Password confirmation must match Password', [{ text: 'OK' }]);
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
          <Text style={authStyles.title}>{`Create \nnew account`}</Text>
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
              clearTextOnFocus={true}
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
              clearTextOnFocus={true}
              textContentType="password"
            />
          </View>
          <Button
            light
            raised
            disabled={this.state.fetching}
            style={authStyles.cta}
            color="#ffcf2b"
            theme={{ ...Theme, roundness: 10 }}
            onPress={this._signUp}>
            <Text style={[authStyles.ctaCopy, authStyles.primaryCtaCopy]}>Create Account</Text>
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

export default withNavigation(SignUpWithEmailScreen);
