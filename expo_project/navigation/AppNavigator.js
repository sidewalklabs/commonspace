import React from "react";
import { createStackNavigator } from "react-navigation";
import colors from "../constants/Colors";
import SurveyScreen from "../screens/SurveyScreen";
import StudyIndexScreen from "../screens/StudyIndexScreen";

export default createStackNavigator(
  {
    SurveyScreen,
    StudyIndexScreen
  },
  {
    initialRouteName: "StudyIndexScreen",
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
