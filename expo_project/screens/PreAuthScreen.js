import React from 'react';
import { TouchableHighlight, Text, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import color from 'color';
import SharedGradient from '../components/SharedGradient';
import authStyles from '../stylesheets/auth';

class PreAuthScreen extends React.Component {
  static navigationOptions = {
    headerTitle: '',
    headerLeft: null,
    gesturesEnabled: false,
  };

  render() {
    return (
      <SharedGradient style={authStyles.container}>
        <View style={authStyles.content}>
          <Text style={authStyles.title}>Before We Begin</Text>
          <Text style={authStyles.paragraph}>
            CommonSpace is designed to collect public life data. Sidewalk Labs stores this data on
            behalf of study organizers.
          </Text>
          <Text style={authStyles.paragraph}>
            To collect data using CommonSpace, you will be asked to login. Sidewalk Labs will use
            this data to authenticate you to the app and notify you about the studies you have opted
            into.
          </Text>
          <Text style={authStyles.paragraph}>
            You can use a demo version of the app without logging in, and no data will be stored.
          </Text>
          <TouchableHighlight
            style={[authStyles.cta, authStyles.primaryCta]}
            underlayColor={color('#ffcf2b').darken(0.2)}
            onPress={() => this.props.navigation.navigate('AuthScreen')}>
            <Text style={[authStyles.ctaCopy, authStyles.primaryCtaCopy]}>Continue</Text>
          </TouchableHighlight>
        </View>
      </SharedGradient>
    );
  }
}

export default withNavigation(PreAuthScreen);
