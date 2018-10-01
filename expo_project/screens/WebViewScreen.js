import React, { Component } from 'react';
import { StyleSheet, View, WebView } from 'react-native';
import { withNavigation } from 'react-navigation';

class WebViewScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: navigation.getParam('title'),
  });

  render() {
    const uri = this.props.navigation.getParam('uri');
    return (
      <View style={styles.container}>
        <WebView source={{ uri }} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default withNavigation(WebViewScreen);
