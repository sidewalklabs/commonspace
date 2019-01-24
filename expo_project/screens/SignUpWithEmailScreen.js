import React from 'react';
import {
  AsyncStorage,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { withNavigation } from 'react-navigation';
import { Button } from 'react-native-paper';
import SharedGradient from '../components/SharedGradient';
import Theme from '../constants/Theme';
import { Icon, WebBrowser } from 'expo';
import { signUpUser } from '../lib/commonsClient';

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
      email: '',
      password: '',
      confirmPassword: '',
    };
  }

  _signUp = async () => {
    const { email, password, confirmPassword } = this.state;
    if (password === confirmPassword) {
      try {
        const token = await signUpUser(email, password);
        await AsyncStorage.multiSet([['token', token], ['email', email]]);
        this.props.navigation.navigate('App');
      } catch (error) {
        Alert.alert(error.name, error.message, [{ text: 'OK' }]);
      }
    } else {
      Alert.alert('Error', 'Password confirmation must match Password', [{ text: 'OK' }]);
    }
  };

  _openLink = async uri => {
    return await WebBrowser.openBrowserAsync(uri);
  };

  render() {
    return (
      <View style={styles.container}>
        <SharedGradient>
          <View style={styles.content}>
            <Image source={require('../assets/images/CSIcon_36_white.png')} style={styles.logo} />
            <Text style={styles.title}>Create new account</Text>
            <View
              style={{
                backgroundColor: 'white',
                padding: 10,
                borderRadius: 20,
                alignSelf: 'stretch',
              }}>
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
              style={styles.cta}
              color="#ffcf2b"
              theme={{ ...Theme, roundness: 10 }}
              onPress={this._signUp}>
              <Text style={styles.ctaCopy}>Create Account</Text>
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
        </SharedGradient>
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
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  ctaCopy: {
    fontFamily: 'product-medium',
    fontSize: 16,
    height: 48,
    lineHeight: 30,
    letterSpacing: 0.5,
    margin: 0,
    padding: 0,
  },
  title: {
    fontSize: 24,
    fontFamily: 'product-bold',
    textAlign: 'center',
    marginBottom: 24,
    color: 'white',
  },
  footer: {
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },
});

export default withNavigation(SignUpWithEmailScreen);
