import { Icon } from 'expo';
import React from 'react';
import {
  Alert,
  ActivityIndicator,
  AsyncStorage,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { Button, Subheading, Title } from 'react-native-paper';
import Theme from '../constants/Theme';
import { withNavigation } from 'react-navigation';
import { getStudies } from '../lib/commonsClient';
import Banner from '../components/Banner';
import StudyFeed from '../components/StudyFeed';

class PersonalStudyIndexScreen extends React.Component {
  state = {
    studies: [],
    loading: true,
  };

  static navigationOptions = ({ navigation }) => ({
    headerTitle: 'Studies',
    headerLeft: (
      <TouchableOpacity
        onPress={() => {
          navigation.toggleDrawer();
        }}
        style={{
          paddingHorizontal: 12,
        }}>
        <Icon.MaterialCommunityIcons name="menu" color="white" size={24} />
      </TouchableOpacity>
    ),
  });

  async componentDidMount() {
    const token = await AsyncStorage.getItem('token');

    if (token) {
      let studies = await getStudies(token).catch(e => {
        console.log('error', e);
        Alert.alert('Error', 'Unable to load your studies. Only demo studies will be available.', [
          { text: 'OK' },
        ]);
      });
      this.setState({ token, studies: studies || [], loading: false });
    } else {
      this.setState({ loading: false });
    }
  }

  render() {
    const { loading, token, studies } = this.state;
    return (
      <View style={styles.container}>
        {loading && <ActivityIndicator />}

        {!loading &&
          !studies.length && (
            <Banner
              title="No Studies Found"
              description="There are no studies assigned to you. If this is an error, reach out to your study coordinator."
              cta="Try the Demo"
              style={styles.banner}
              ctaOnPress={() => this.props.navigation.navigate('DemoStack')}
            />
          )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAFAFA',
    flex: 1,
  },
  banner: {
    color: '#333333',
    textAlign: 'center',
    fontFamily: 'product-bold',
    marginVertical: 20,
  },
  zeroMessage: {
    marginLeft: 24,
    marginRight: 24,
    flex: 1,
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    color: '#333333',
    textAlign: 'center',
    fontFamily: 'product-bold',
    fontSize: 36,
    lineHeight: 42,
    marginBottom: 10,
  },
  description: {
    color: '#333333',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 20,
  },
  button: {
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'column',
  },
  buttonText: {
    fontFamily: 'product-medium',
    fontSize: 16,
    height: 48,
    lineHeight: 30,
    letterSpacing: 0.5,
  },
  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default withNavigation(PersonalStudyIndexScreen);
