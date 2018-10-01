import {
  createDrawerNavigator,
  createStackNavigator,
  createSwitchNavigator,
} from 'react-navigation';
import Theme from '../constants/Theme';
import AuthScreen from '../screens/AuthScreen';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import ComingSoonScreen from '../screens/ComingSoonScreen';
import SurveyScreen from '../screens/SurveyScreen';
import StudyIndexScreen from '../screens/StudyIndexScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import WebViewScreen from '../screens/WebViewScreen';

import DrawerNavigatorScreen from '../screens/DrawerNavigatorScreen';

const navigationOptions = {
  headerStyle: {
    backgroundColor: Theme.colors.primary,
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: '600',
    fontFamily: Theme.fonts.medium,
  },
};

const AppStack = createStackNavigator(
  {
    StudyIndexScreen,
    SurveyScreen,
    ComingSoonScreen,
    WebViewScreen,
  },
  {
    initialRouteName: 'StudyIndexScreen',
    navigationOptions,
  },
);
const AuthStack = createStackNavigator(
  {
    AuthScreen,
    OnboardingScreen,
    WebViewScreen,
  },
  {
    initialRouteName: 'OnboardingScreen',
    navigationOptions,
  },
);

const DrawerNavigator = createDrawerNavigator(
  {
    AppStack,
  },
  {
    initialRouteName: 'AppStack',
    contentComponent: DrawerNavigatorScreen,
  },
);

export default createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: DrawerNavigator,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'AuthLoading',
  },
);
