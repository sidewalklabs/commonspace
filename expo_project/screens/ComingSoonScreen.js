import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { Title } from 'react-native-paper';

class ComingSoonScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Title>Coming Soon!</Title>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
});

export default ComingSoonScreen;
