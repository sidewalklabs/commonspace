import { Icon } from 'expo';
import React from 'react';
import {
  Alert,
  ActivityIndicator,
  AsyncStorage,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
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
              title="You do not have any studies"
              description="You do not have any studies assigned to you currently. If you believe this is
                incorrect, please reach out to your study coordinator. In the mean time, try a demo study"
              cta="Try a demo"
              ctaOnPress={() => this.props.navigation.navigate('DemoStack')}
            />
          )}
        {!loading &&
          studies.length && <StudyFeed token={token} studies={studies} title="Your studies" />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
});

export default withNavigation(PersonalStudyIndexScreen);
