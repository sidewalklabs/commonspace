import React from "react";
import { createStackNavigator } from "react-navigation";
import colors from "../constants/Colors";
import HomeScreen from "../screens/HomeScreen";

export default createStackNavigator(
  {
    Home: HomeScreen
  },
  {
    initialRouteName: "Home",
    navigationOptions: {
      headerStyle: {
        backgroundColor: colors.colorPrimary
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold"
      }
    }
  }
);
