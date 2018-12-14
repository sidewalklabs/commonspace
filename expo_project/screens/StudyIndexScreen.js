import { Icon } from 'expo';
import React from 'react';
import {
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

import { getStudies, getSurveysForStudy } from '../lib/commonsClient';

function typeToRouteName(type) {
  switch (type) {
    case 'activity':
      return 'SurveyScreen';
    case 'movement':
      return 'PeopleMovingCountScreen';
    default:
      return 'ComingSoonScreen';
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
    const fakeStudy = {
      authorName: 'Ananta',
      protocolVersion: '1.0',
      studyId: '12345',
      surveyors: ['pandananta@gmail.com', 'thorncliffesurveyorone@gmail.com'],
      title: '000 test',
      type: 'movement',
      fields: [],
      map: {},
      surveys: [
        {
          endDate: '2018-10-12T22:00:00Z',
          locationId: '0',
          survey_location: { type: 'polygon', coordinates: [] },
          method: 'analog',
          representation: 'absolute',
          startDate: '2018-10-12T21:00:00Z',
          studyId: '12345',
          surveyId: '1234566',
          title: 'test',
          type: 'peopleMovingCount',
          surveyorEmail: 'pandananta@gmail.com',
          userId: '123412341234',
          zone: 'Zone 12',
        },
      ],
    };
    const token = await AsyncStorage.getItem('token');
    let studies = await getStudies(token);
    studies.push(fakeStudy);
    studies = _.sortBy(studies, 'title');
    this.setState({ token, studies, loading: false });
  }

  render() {
    const { token, studies } = this.state;
    return (
      <View style={[styles.container]}>
        <ScrollView style={[styles.container]}>
          {this.state.loading && <ActivityIndicator />}
          {studies.map(study => {
            const {
              studyId,
              title: studyName,
              type: studyType,
              authorName: studyAuthor,
              surveys,
            } = study;
            // TODO: move these to backend
            const authorUrl = 'https://parkpeople.ca/';
            const studyInstructions =
              'You will be using this app to collect observational data about what public activities people are doing in Thorncliffe Park. Following the study, a report will be made available online.';
            return (
              <Card elevation={3} key={study.studyId} style={styles.card}>
                <CardContent style={styles.studyHeader}>
                  <Title>{studyName}</Title>
                  <Paragraph>
                    by{' '}
                    <Text
                      style={{ color: 'blue' }}
                      onPress={() =>
                        this.props.navigation.navigate('WebViewScreen', {
                          uri: authorUrl,
                          title: studyAuthor,
                        })
                      }>
                      {studyAuthor}
                    </Text>
                  </Paragraph>

                  {studyInstructions && <Paragraph>{studyInstructions}</Paragraph>}
                </CardContent>
                {surveys.map(survey => {
                  const {
                    survey_id: surveyId,
                    title: surveyTitle,
                    locationId,
                    survey_location: zoneFeatureGeoJson,
                  } = survey;
                  const zoneCoordinates = _.map(zoneFeatureGeoJson.coordinates[0], c => {
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
                                studyId,
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
          })}
          {!this.state.loading &&
            !this.state.studies.length && (
              <Paragraph>
                You do not have any studies assigned to you currently. If you believe this is
                incorrect, please reach out to your study coordinator.
              </Paragraph>
            )}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    padding: 10,
  },
  card: {
    marginBottom: 20,
  },
  studyHeader: {
    paddingBottom: 10,
  },
  sectionTitle: {
    backgroundColor: 'white',
    marginBottom: 10,
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
