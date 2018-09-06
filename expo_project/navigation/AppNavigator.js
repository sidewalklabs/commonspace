import { createStackNavigator, createSwitchNavigator } from "react-navigation";
import colors from "../constants/Colors";
import Theme from "../constants/Theme";
import AuthScreen from "../screens/AuthScreen";
import AuthLoadingScreen from "../screens/AuthLoadingScreen";
import ComingSoonScreen from "../screens/ComingSoonScreen";
import SurveyScreen from "../screens/SurveyScreen";
import StudyIndexScreen from "../screens/StudyIndexScreen";
import PrivacyScreen from "../screens/PrivacyScreen";

const navigationOptions = {
  headerStyle: {
    backgroundColor: colors.colorPrimary
  },
  headerTintColor: "#fff",
  headerTitleStyle: {
    fontWeight: "600",
    fontFamily: Theme.fonts.medium
  }
};

const AppStack = createStackNavigator(
  {
    StudyIndexScreen,
    SurveyScreen,
    ComingSoonScreen
  },
  {
    initialRouteName: "StudyIndexScreen",
    navigationOptions
  }
);
const AuthStack = createStackNavigator(
  {
    AuthScreen,
    PrivacyScreen
  },
  {
    initialRouteName: "AuthScreen",
    navigationOptions
  }
);

export default createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
    Auth: AuthStack
  },
  {
    initialRouteName: "AuthLoading"
  }
);
