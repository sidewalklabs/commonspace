import React from 'react';
import { ActivityIndicator, AsyncStorage, ScrollView, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';

import { Button, Divider, Paragraph } from 'react-native-paper';

class DrawerNavigatorScreen extends React.Component {
  state = {
    loading: true,
    userEmail: '',
  };

  async componentDidMount() {
    const userEmail = await AsyncStorage.getItem('userEmail');
    this.setState({ userEmail, loading: false });
  }

  _signOut = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {this.state.loading && <ActivityIndicator />}
          {!this.state.loading && (
            <View>
              <Paragraph style={styles.text}>You are logged in as {this.state.userEmail}</Paragraph>
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
          )}
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
