import React from 'react';
import { AsyncStorage, NavigationActions, StatusBar, View } from 'react-native';
import { AppLoading, Constants, Font, Icon } from 'expo';
import firebase from 'firebase';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './navigation/AppNavigator';
import { logInUserWithFirebaseAccessToken } from './lib/commonsClient';
import Theme from './constants/Theme';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoadingComplete: false,
    };
  }

  loadResourcesAsync = async () =>
    await Font.loadAsync({
      ...Icon.Ionicons.font,
      ...Icon.MaterialIcons.font,
      ...Icon.MaterialCommunityIcons.font,
      ...Icon.Feather.font,
      monaco: require('./assets/fonts/monaco.ttf'),
      product: require('./assets/fonts/GoogleSans-Regular.ttf'),
      'product-regular': require('./assets/fonts/GoogleSans-Regular.ttf'),
      'product-medium': require('./assets/fonts/GoogleSans-Medium.ttf'),
      'product-bold': require('./assets/fonts/GoogleSans-Bold.ttf'),
      'product-italic': require('./assets/fonts/GoogleSans-Italic.ttf'),
    });


  handleFinishLoading = async () => {
    const { firebaseConfig } = Constants.manifest.extra;

    firebase.initializeApp(firebaseConfig);

    firebase.auth().onAuthStateChanged(async function(user) {
      if (user && !user.emailVerified) {
          console.warn('user has not verfied with firebase');
          await user.sendEmailVerification();
          firebase.auth().signOut();
      } else if (user && user.emailVerified) {
          const firebaseAccessToken = await user.getIdToken();
          const jwtToken = await logInUserWithFirebaseAccessToken(firebaseAccessToken);
          await AsyncStorage.multiSet([['token', jwtToken], ['email', user.email]]);
          NavigationActions.navigate('App');
      }
  });
    this.setState({ isLoadingComplete: true });
  };

  render() {
    const { isLoadingComplete } = this.state;

    if (!isLoadingComplete) {
      return (
        <AppLoading startAsync={this.loadResourcesAsync} onFinish={this.handleFinishLoading} />
      );
    }
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <PaperProvider theme={Theme}>
          <StatusBar barStyle="light-content" />
          <AppNavigator />
        </PaperProvider>
      </View>
    );
  }
}
