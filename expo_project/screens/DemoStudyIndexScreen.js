import { Icon } from 'expo';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { withNavigation } from 'react-navigation';
import { peopleMovingDemoStudy, stationaryActivityDemoStudy } from '../config/demoStudies';

import StudyFeed from '../components/StudyFeed';

const DEMO_STUDIES = [stationaryActivityDemoStudy, peopleMovingDemoStudy];

class DemoStudyIndexScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: 'Demo Studies',
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

  render() {
    return (
      <StudyFeed
        studies={DEMO_STUDIES}
        title="Demo Studies"
        refreshing={false}
        onRefresh={() => {}}
      />
    );
  }
}

export default withNavigation(DemoStudyIndexScreen);
