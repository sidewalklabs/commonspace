import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, View, WebView } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Button, Divider, withTheme } from 'react-native-paper';

class WebViewScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: navigation.getParam('title'),
  });

  render() {
    const uri = this.props.navigation.getParam('uri');
    return (
      <View style={styles.container}>
        <WebView source={{ uri }} />
        <Divider />
        <View elevation={4} style={styles.footer}>
          <Button
            raised
            primary
            dark
            theme={{ ...this.props.theme, roundness: 100 }}
            onPress={() => this.props.navigation.goBack()}>
            Done
          </Button>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  footer: {
    padding: 20,
  },
});

export default withNavigation(withTheme(WebViewScreen));
