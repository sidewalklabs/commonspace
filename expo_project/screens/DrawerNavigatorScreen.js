import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import { Divider } from 'react-native-paper';
import { AppAuth, Constants, Icon, WebBrowser } from 'expo';
import { SafeAreaView } from 'react-navigation';
import Theme from '../constants/Theme';
import urls from '../config/urls';
import { logOut } from '../lib/commonsClient';

class DrawerNavigatorScreen extends React.Component {
  state = {
    email: null,
    loading: true,
  };

  async componentDidMount() {
    const email = await AsyncStorage.getItem('email');
    this.setState({ email, loading: false });
  }

  _signOut = async () => {
    const accessToken = await AsyncStorage.getItem('googleAccessToken');
    if (accessToken) {
      // If user logged in with google oauth, revoke the access token
      try {
        const { appOwnership, manifest } = Constants;
        const { googleAuthClientId } = manifest.extra;
        const clientId = googleAuthClientId[appOwnership][Platform.OS];

        await AppAuth.revokeAsync(
          {
            issuer: 'https://accounts.google.com',
            clientId,
          },
          {
            token: accessToken,
            isClientIdProvided: true,
          },
        );
      } catch (error) {
        Alert.alert(error.name, error.message, [{ text: 'OK' }]);
      }
    }
    const token = await AsyncStorage.getItem('token');
    await logOut(token);
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  };

  _openUrl = async url => WebBrowser.openBrowserAsync(url);

  render() {
    const { loading, email } = this.state;
    const { navigation, activeItemKey } = this.props;
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.container} forceInset={{ top: 'always', horizontal: 'never' }}>
          {loading && <ActivityIndicator />}
          {!loading && (
            <View style={styles.container}>
              <View style={styles.header}>
                <Image
                  style={styles.logo}
                  source={require('../assets/images/CSIcon_24_blue.png')}
                />
                <Text style={styles.logoText}>CommonSpace</Text>
              </View>
              <Divider style={styles.divider} />
              <ScrollView>
                {email && (
                  <TouchableHighlight
                    underlayColor={`${Theme.colors.primary}15`}
                    style={[styles.button, activeItemKey === 'AppStack' && styles.activeButton]}
                    onPress={() => navigation.navigate('AppStack')}>
                    <View style={styles.buttonRow}>
                      <Icon.Ionicons
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
                    <Icon.Ionicons
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
                  onPress={() => this._openUrl(urls.homepage)}>
                  <View style={styles.buttonRow}>
                    <Icon.Ionicons
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
                  onPress={() => this._openUrl(urls.privacy)}>
                  <View style={styles.buttonRow}>
                    <Text style={styles.buttonText}>Privacy Policy</Text>
                  </View>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor={`${Theme.colors.primary}15`}
                  style={styles.button}
                  onPress={() => this._openUrl(urls.terms)}>
                  <View style={styles.buttonRow}>
                    <Text style={styles.buttonText}>Terms of Service</Text>
                  </View>
                </TouchableHighlight>
              </ScrollView>
              <Divider style={styles.divider} />
              <View style={styles.footer}>
                {email && (
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
                      {email}
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
                    <Text style={styles.signOutButtonText}>{email ? 'Sign Out' : 'Exit Demo'}</Text>
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

export default DrawerNavigatorScreen;
