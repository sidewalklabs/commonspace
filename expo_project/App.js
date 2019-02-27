import React from 'react';
import { StatusBar, View } from 'react-native';
import { AppLoading, Font, Icon } from 'expo';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './navigation/AppNavigator';
import Theme from './constants/Theme';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoadingComplete: false,
    };
  }

  loadResourcesAsync = async () =>
    Font.loadAsync({
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
