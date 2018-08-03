import React from "react";
import { createStackNavigator } from "react-navigation";

import HomeScreen from "../screens/HomeScreen";
import SurveyScreen from "../screens/SurveyScreen";

export default createStackNavigator(
  {
    Home: HomeScreen,
    Survey: SurveyScreen
  },
  {
    initialRouteName: "Home"
  }
);
