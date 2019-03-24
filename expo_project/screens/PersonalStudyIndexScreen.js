import React from 'react';
import { Alert, AsyncStorage, StyleSheet, TouchableOpacity, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Icon } from 'expo';
import { getStudies } from '../lib/commonsClient';
import Banner from '../components/Banner';
import StudyFeed from '../components/StudyFeed';

class PersonalStudyIndexScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: 'Studies',
    headerLeft: (
      <TouchableOpacity
        onPress={() => {
          navigation.toggleDrawer();
        }}
        style={{
          paddingHorizontal: 12,
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Icon.MaterialCommunityIcons name="menu" color="white" size={24} />
      </TouchableOpacity>
    ),
  });

  state = {
    studies: [],
    loading: true,
  };

  async componentDidMount() {
    this.refresh();
  }

  async refresh() {
    try {
      this.setState({ loading: true });
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const studies = await getStudies(token);
        this.setState({ token, studies: studies || [], loading: false });
      } else {
        this.setState({ loading: false });
      }
    } catch (e) {
      Alert.alert('Error', e.message, [{ text: 'OK' }]);
      this.setState({ loading: false });
    }
  }

  render() {
    const { loading, token, studies } = this.state;
    return (
      <View style={styles.container}>
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
        {(loading || !!studies.length) && (
          <StudyFeed
            token={token}
            studies={studies}
            title="Your studies"
            onRefresh={() => this.refresh()}
            refreshing={loading}
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
});

export default withNavigation(PersonalStudyIndexScreen);
