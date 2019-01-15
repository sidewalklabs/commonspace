import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { Button, Divider } from 'react-native-paper';
import { WebBrowser } from 'expo';
import { SafeAreaView } from 'react-navigation';
import Theme from '../constants/Theme';

class DrawerNavigatorScreen extends React.Component {
  state = {
    token: null,
    loading: true,
  };

  _signOut = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  };

  _openPrivacyPage = async () => {
    return await WebBrowser.openBrowserAsync('http://www.sidewalktoronto.com/privacy');
  };

  async componentDidMount() {
    const token = await AsyncStorage.getItem('token');
    this.setState({ token, loading: false });
  }

  render() {
    const { loading, token } = this.state;
    const { navigation, activeItemKey } = this.props;
    // TODO: Swap out links for the real ones
    // TODO: make sure the navigation stack isn't growing infinitely

    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.container} forceInset={{ top: 'always', horizontal: 'never' }}>
          {loading && <ActivityIndicator />}
          {!loading && (
            <View style={styles.container}>
              <View style={styles.header}>
                <Image
                  source={require('../assets/images/CSIcon_24_blue.png')}
                  style={styles.logo}
                />
                <Text style={styles.logo}>CommonSpace</Text>
              </View>
              <Divider style={styles.divider} />
              <ScrollView>
                {token && (
                  <Button
                    primary
                    style={[styles.button, activeItemKey === 'AppStack' && styles.activeButton]}
                    onPress={() => navigation.navigate('AppStack')}>
                    <Text
                      style={[
                        styles.buttonText,
                        activeItemKey === 'AppStack' && styles.activeButtonText,
                      ]}>
                      Studies
                    </Text>
                  </Button>
                )}
                <Button
                  primary
                  style={[styles.button, activeItemKey === 'DemoStack' && styles.activeButton]}
                  onPress={() => navigation.navigate('DemoStack')}>
                  <Text
                    style={[
                      styles.buttonText,
                      activeItemKey === 'DemoStack' && styles.activeButtonText,
                    ]}>
                    Demo Studies
                  </Text>
                </Button>
                <Button primary style={styles.button} onPress={this._openPrivacyPage}>
                  <Text style={styles.buttonText}>Help & Feedback</Text>
                </Button>
                <Divider style={styles.divider} />
                <Button primary style={styles.button} onPress={this._openPrivacyPage}>
                  <Text style={styles.buttonText}>Privacy Policy</Text>
                </Button>
                <Button primary style={styles.button} onPress={this._openPrivacyPage}>
                  <Text style={styles.buttonText}>Terms of Service</Text>
                </Button>
              </ScrollView>
              <Divider style={styles.divider} />
              <View style={styles.footer}>
                {token && (
                  <View style={styles.loggedInAsContainer}>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={{ fontWeight: 'bold' }}>
                      First name Last name
                    </Text>
                    <Text numberOfLines={1} ellipsizeMode="tail">
                      myemailyolo@gmail.com
                    </Text>
                  </View>
                )}
                <View style={styles.signOutContainer}>
                  <Button
                    primary
                    style={styles.signOutButton}
                    onPress={this._signOut}
                    theme={{ ...Theme, roundness: 20 }}>
                    <Text style={[styles.buttonText, styles.activeButtonText]}>
                      {token ? 'Sign Out' : 'Exit Demo'}
                    </Text>
                  </Button>
                </View>
              </View>
            </View>
          )}
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    margin: 10,
  },
  activeButton: {
    backgroundColor: `${Theme.colors.primary}30`,
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'black',
  },
  activeButtonText: {
    color: Theme.colors.primary,
  },
  header: {
    flexDirection: 'row',
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loggedInAsContainer: {
    flex: 1,
    marginRight: 10,
  },
  signOutContainer: {
    alignItems: 'stretch',
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  divider: {
    marginVertical: 1,
  },
});

DrawerNavigatorScreen.propTypes = {
  navigation: PropTypes.object,
};

export default DrawerNavigatorScreen;
