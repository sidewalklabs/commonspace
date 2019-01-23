import React from 'react';
import { StatusBar, Text, View } from 'react-native';
import { AppLoading, Font, Icon } from 'expo';
import AppNavigator from './navigation/AppNavigator';
import { Provider as PaperProvider } from 'react-native-paper';
import Theme from './constants/Theme';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoadingComplete: false,
    };
    Text.defaultProps.style = { fontFamily: 'product' };
  }

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading startAsync={this._loadResourcesAsync} onFinish={this._handleFinishLoading} />
      );
    } else {
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

  _loadResourcesAsync = async () => {
    return Font.loadAsync({
      ...Icon.Ionicons.font,

      monaco: require('./assets/fonts/monaco.ttf'),

      roboto: require('./assets/fonts/Roboto-Regular.ttf'),
      'roboto-thin': require('./assets/fonts/Roboto-Thin.ttf'),
      'roboto-light': require('./assets/fonts/Roboto-Light.ttf'),
      'roboto-medium': require('./assets/fonts/Roboto-Medium.ttf'),

      product: require('./assets/fonts/GoogleSans-Regular.ttf'),
      'product-regular': require('./assets/fonts/GoogleSans-Regular.ttf'),
      'product-medium': require('./assets/fonts/GoogleSans-Medium.ttf'),
      'product-bold': require('./assets/fonts/GoogleSans-Bold.ttf'),
      'product-italic': require('./assets/fonts/GoogleSans-Italic.ttf'),
    });
  };

  _handleFinishLoading = async () => {
    this.setState({ isLoadingComplete: true });
  };
}
