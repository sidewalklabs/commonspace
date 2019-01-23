import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { Divider } from 'react-native-paper';
import { WebBrowser } from 'expo';
import { Ionicons } from '@expo/vector-icons';
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
                <Text style={styles.logoText}>CommonSpace</Text>
              </View>
              <Divider style={styles.divider} />
              <ScrollView>
                {token && (
                  <TouchableHighlight
                    underlayColor={`${Theme.colors.primary}15`}
                    style={[styles.button, activeItemKey === 'AppStack' && styles.activeButton]}
                    onPress={() => navigation.navigate('AppStack')}>
                    <View style={styles.buttonRow}>
                      <Ionicons
                        style={[
                          styles.buttonIcon,
                          activeItemKey === 'AppStack' && styles.activeButtonIcon,
                        ]}
                        name="md-pin"
                        size={24}
                        color="#000000"
                      />
                      <Text
                        style={[
                          styles.buttonText,
                          activeItemKey === 'AppStack' && styles.activeButtonText,
                        ]}>
                        Studies
                      </Text>
                    </View>
                  </TouchableHighlight>
                )}
                <TouchableHighlight
                  underlayColor={`${Theme.colors.primary}15`}
                  style={[styles.button, activeItemKey === 'DemoStack' && styles.activeButton]}
                  onPress={() => navigation.navigate('DemoStack')}>
                  <View style={styles.buttonRow}>
                    <Ionicons
                      style={[
                        styles.buttonIcon,
                        activeItemKey === 'DemoStack' && styles.activeButtonIcon,
                      ]}
                      name="md-arrow-dropright-circle"
                      size={24}
                      color="#000000"
                    />
                    <Text
                      style={[
                        styles.buttonText,
                        activeItemKey === 'DemoStack' && styles.activeButtonText,
                      ]}>
                      Demo Studies
                    </Text>
                  </View>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor={`${Theme.colors.primary}15`}
                  style={styles.button}
                  onPress={this._openPrivacyPage}>
                  <View style={styles.buttonRow}>
                    <Ionicons
                      style={styles.buttonIcon}
                      name="md-help-circle"
                      size={24}
                      color="#000000"
                    />
                    <Text style={styles.buttonText}>Help &amp; Feedback</Text>
                  </View>
                </TouchableHighlight>
                <Divider style={styles.divider} />
                <TouchableHighlight
                  underlayColor={`${Theme.colors.primary}15`}
                  style={styles.button}
                  onPress={this._openPrivacyPage}>
                  <View style={styles.buttonRow}>
                    <Text style={styles.buttonText}>Privacy Policy</Text>
                  </View>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor={`${Theme.colors.primary}15`}
                  style={styles.button}
                  onPress={this._openPrivacyPage}>
                  <View style={styles.buttonRow}>
                    <Text style={styles.buttonText}>Terms of Service</Text>
                  </View>
                </TouchableHighlight>
              </ScrollView>
              <Divider style={styles.divider} />
              <View style={styles.footer}>
                {token && (
                  <View style={styles.loggedInAsContainer}>
                    <Text
                      numberOfLines={1}
                      style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.5)' }}
                      ellipsizeMode="tail">
                      Logged in as
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.8)' }}
                      ellipsizeMode="tail">
                      myemailyolo@gmail.com
                    </Text>
                  </View>
                )}
                <View style={styles.signOutContainer}>
                  <TouchableHighlight
                    underlayColor={`${Theme.colors.primary}15`}
                    primary
                    style={styles.signOutButton}
                    onPress={this._signOut}
                    theme={{ ...Theme, roundness: 20 }}>
                    <Text style={styles.signOutButtonText}>{token ? 'Sign Out' : 'Exit Demo'}</Text>
                  </TouchableHighlight>
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
    marginTop: 8,
    marginLeft: 8,
    marginRight: 8,
    borderRadius: 4,
  },
  buttonRow: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  activeButton: {
    backgroundColor: `${Theme.colors.primary}15`,
  },
  buttonIcon: {
    marginLeft: 8,
    marginRight: 24,
    marginTop: 0,
    width: 24,
    height: 24,
    textAlign: 'center',
    color: 'rgba(0,0,0,.5)',
  },
  activeButtonIcon: {
    color: Theme.colors.primary,
  },
  buttonText: {
    color: '#323232',
    fontFamily: 'product-medium',
    lineHeight: 20,
    marginTop: 2,
    marginLeft: 8,
    flex: 1,
  },
  activeButtonText: {
    color: Theme.colors.primary,
  },
  header: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 16,
  },
  logo: {
    marginLeft: 16,
  },
  logoText: {
    color: '#323232',
    fontSize: 16,
    fontFamily: 'product-bold',
    lineHeight: 24,
    marginLeft: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loggedInAsContainer: {
    flex: 1,
    marginRight: 4,
  },
  signOutContainer: {
    alignItems: 'stretch',
  },
  signOutButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderColor: `${Theme.colors.primary}50`,
  },
  signOutButtonText: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontFamily: 'product-bold',
  },
  divider: {
    marginTop: 8,
    height: 0.5,
  },
});

DrawerNavigatorScreen.propTypes = {
  navigation: PropTypes.object,
};

export default DrawerNavigatorScreen;
