import React from 'react';
import { ActivityIndicator, AsyncStorage, ScrollView, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import { Button, Divider, Paragraph } from 'react-native-paper';
import { Constants } from 'expo';
const EXPO_BUILD_NUMBER = 2;

class DrawerNavigatorScreen extends React.Component {
  _signOut = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            <Paragraph style={styles.text}>
              version {Constants.manifest.version}.{EXPO_BUILD_NUMBER}{' '}
            </Paragraph>
            <Divider />
            <Button
              primary
              onPress={() =>
                this.props.navigation.navigate('WebViewScreen', {
                  uri: 'http://www.sidewalktoronto.com/privacy',
                  title: 'Privacy & Terms',
                })
              }>
              Privacy & Terms
            </Button>
            <Button primary onPress={this._signOut}>
              Log Out
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'stretch',
  },
  text: {
    textAlign: 'center',
    marginBottom: 20,
  },
});

DrawerNavigatorScreen.propTypes = {
  navigation: PropTypes.object,
};

export default DrawerNavigatorScreen;
