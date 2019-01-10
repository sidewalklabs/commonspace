import { Icon } from 'expo';
import React from 'react';
import {
  Alert,
  ActivityIndicator,
  AsyncStorage,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { withNavigation } from 'react-navigation';
import { Button, Card, CardContent, Divider, Title, Paragraph } from 'react-native-paper';
import * as _ from 'lodash';

import { peopleMovingDemoStudy, stationaryActivityDemoStudy } from '../config/demoStudies';

import { getStudies } from '../lib/commonsClient';

function typeToRouteName(type) {
  switch (type) {
    case 'stationary':
      return 'SurveyScreen';
    case 'movement':
      return 'PeopleMovingCountScreen';
    default:
      return 'ComingSoonScreen';
  }
}

class StudyCard extends React.Component {
  render() {
    const { token, study, navigation } = this.props;
    const {
      description,
      title: studyName,
      type: studyType,
      authorName,
      surveys,
      fields: studyFields,
    } = study;
    // TODO: move these to backend
    const studyAuthor = authorName || 'Unknown author';
    const authorUrl = 'https://placeholder.ca/';
    return (
      <Card elevation={3} style={styles.card}>
        <CardContent style={styles.studyHeader}>
          <Title>{studyName}</Title>
          <Paragraph>
            by{' '}
            <Text
              style={{ color: 'blue' }}
              onPress={() =>
                navigation.navigate('WebViewScreen', {
                  uri: authorUrl,
                  title: studyAuthor,
                })
              }>
              {studyAuthor}
            </Text>
          </Paragraph>
          {description && <Paragraph>{description}</Paragraph>}
        </CardContent>
        {surveys.map(survey => {
          const { survey_id: surveyId, title, survey_location: zoneFeatureGeoJson } = survey;
          const surveyTitle = title || 'Unnamed Survey';
          const coordinates = !zoneFeatureGeoJson ? [] : zoneFeatureGeoJson.coordinates[0];
          const zoneCoordinates = _.map(coordinates, c => {
            return { longitude: c[0], latitude: c[1] };
          });
          return (
            <View key={surveyId}>
              <Divider />
              <CardContent style={styles.surveyRow}>
                <View style={styles.contentWrapper}>
                  <Text style={styles.surveyTitle}>{surveyTitle}</Text>
                </View>
                <View style={styles.buttonWrapper}>
                  <Button
                    dark
                    raised
                    primary
                    onPress={() =>
                      this.props.navigation.navigate(typeToRouteName(studyType), {
                        studyFields,
                        surveyId,
                        studyName,
                        studyAuthor,
                        studyType,
                        surveyTitle,
                        zoneCoordinates,
                        token,
                      })
                    }>
                    Enter
                  </Button>
                </View>
              </CardContent>
            </View>
          );
        })}
      </Card>
    );
  }
}

class StudyIndexScreen extends React.Component {
  state = {
    studies: [],
    loading: true,
  };

  static navigationOptions = ({ navigation }) => ({
    headerTitle: 'Your Studies',
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
    let studies = await getStudies(token).catch(e => {
      console.log('error', e);
      Alert.alert('Error', 'Unable to load your studies. Only demo studies will be available.', [
        { text: 'OK' },
      ]);
    });
    this.setState({ token, studies: studies || [], loading: false });
  }

  render() {
    const { loading, token, studies } = this.state;
    const demos = [peopleMovingDemoStudy, stationaryActivityDemoStudy];
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {loading && <ActivityIndicator />}
          <Text style={styles.sectionTitle}>Your Studies</Text>
          {!loading &&
            !studies.length && (
              <Paragraph style={styles.sectionDescription}>
                You do not have any studies assigned to you currently. If you believe this is
                incorrect, please reach out to your study coordinator.
              </Paragraph>
            )}
          {studies.map((study, index) => (
            <StudyCard key={index} study={study} token={token} navigation={this.props.navigation} />
          ))}
          <Divider style={styles.sectionDivider} />
          <Text style={styles.sectionTitle}>Demos and Training</Text>
          <Paragraph style={styles.sectionDescription}>
            Demo studies are for training purposes, and will not save.
          </Paragraph>
          {demos.map((study, index) => (
            <StudyCard key={index} study={study} token={token} navigation={this.props.navigation} />
          ))}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  card: {
    marginBottom: 20,
  },
  studyHeader: {
    paddingBottom: 10,
  },
  sectionTitle: {
    backgroundColor: 'white',
    marginVertical: 10,
    fontWeight: 'bold',
    color: '#9a9a9a',
  },
  sectionDescription: {
    marginVertical: 10,
  },
  sectionDivider: {
    marginVertical: 10,
  },
  surveyRow: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  surveyTitle: {
    fontWeight: 'bold',
  },
  contentWrapper: {
    flex: 1,
  },
  buttonWrapper: {
    marginLeft: 10,
  },
});

export default withNavigation(StudyIndexScreen);
