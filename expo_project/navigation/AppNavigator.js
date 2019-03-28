import {
  createDrawerNavigator,
  createStackNavigator,
  createSwitchNavigator,
} from 'react-navigation';
import Theme from '../constants/Theme';
import AuthScreen from '../screens/AuthScreen';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import ComingSoonScreen from '../screens/ComingSoonScreen';
import DemoStudyIndexScreen from '../screens/DemoStudyIndexScreen';
import DrawerNavigatorScreen from '../screens/DrawerNavigatorScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import SignUpWithEmailScreen from '../screens/SignUpWithEmailScreen';
import SurveyScreen from '../screens/SurveyScreen';
import LogInWithEmailScreen from '../screens/LogInWithEmailScreen';
import MarkerListScreen from '../screens/MarkerListScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PeopleMovingCountScreen from '../screens/PeopleMovingCountScreen';
import PersonalStudyIndexScreen from '../screens/PersonalStudyIndexScreen';
import PreAuthScreen from '../screens/PreAuthScreen';

const studyScreens = {
  SurveyScreen,
  MarkerListScreen,
  PeopleMovingCountScreen,
  ComingSoonScreen,
};

const navigationOptions = {
  headerStyle: {
    backgroundColor: Theme.colors.primary,
    borderBottomWidth: 0,
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: '600',
    fontFamily: Theme.fonts.medium,
  },
};

const AppStack = createStackNavigator(
  {
    PersonalStudyIndexScreen,
    ...studyScreens,
  },
  {
    initialRouteName: 'PersonalStudyIndexScreen',
    navigationOptions,
  },
);

const DemoStack = createStackNavigator(
  {
    DemoStudyIndexScreen,
    ...studyScreens,
  },
  {
    initialRouteName: 'DemoStudyIndexScreen',
    navigationOptions,
  },
);

const AuthStack = createStackNavigator(
  {
    OnboardingScreen,
    PreAuthScreen,
    AuthScreen,
    LogInWithEmailScreen,
    SignUpWithEmailScreen,
    ForgotPasswordScreen,
  },
  {
    initialRouteName: 'OnboardingScreen',
    navigationOptions: {
      ...navigationOptions,
      headerStyle: {
        ...navigationOptions.headerStyle,
        elevation: 0, // remove shadow on android
        backgroundColor: 'transparent',
        position: 'absolute',
        zIndex: 100,
        top: 0,
        left: 0,
        right: 0,
      },
    },
  },
);

const DrawerNavigator = createDrawerNavigator(
  {
    AppStack: { screen: AppStack },
    DemoStack: { screen: DemoStack },
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
