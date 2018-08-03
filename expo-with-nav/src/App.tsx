import { AppLoading } from "expo";
import React from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import AppNavigator from "./navigation/AppNavigator";

import * as firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyBsEnlfOHtxIxhOwgZm10X5XJNQhQSkWoY",
  authDomain: "test-project-a9f3e.firebaseapp.com",
  databaseURL: "https://test-project-a9f3e.firebaseio.com",
  storageBucket: "test-project-a9f3e.appspot.com"
};

firebase.initializeApp(firebaseConfig);

export default class App extends React.Component {
  state = { isLoadingComplete: false };

  render() {
    if (!this.state.isLoadingComplete) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <View style={styles.container}>
          {Platform.OS === "ios" && <StatusBar barStyle="default" />}
          <AppNavigator />
        </View>
      );
    }
  }

  _loadResourcesAsync = async () => Promise.resolve();

  _handleLoadingError = (error: any) => console.warn(error);

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  }
});
