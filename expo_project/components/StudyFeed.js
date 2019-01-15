import { WebBrowser } from 'expo';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Button, Card, CardContent, Divider, Title, Paragraph } from 'react-native-paper';
import * as _ from 'lodash';
import moment from 'moment';
import Theme from '../constants/Theme';

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
  _openLink = async uri => {
    return await WebBrowser.openBrowserAsync(uri);
  };

  render() {
    const { token, study } = this.props;
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
            <Text style={{ color: 'blue' }} onPress={() => this._openLink(authorUrl)}>
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
          let inProgressNow = false;
          if (survey.start_date && survey.end_date) {
            const today = moment();
            const startDate = moment(survey.start_date);
            const endDate = moment(survey.end_date);
            inProgressNow = today.isBetween(startDate, endDate);
          }
          return (
            <View key={surveyId}>
              <Divider />
              <CardContent style={[styles.surveyRow, inProgressNow && styles.activeSurveyRow]}>
                <View style={styles.contentWrapper}>
                  <Text style={styles.surveyTitle}>{surveyTitle}</Text>
                  {inProgressNow && <Text style={styles.inProgressText}>In Progress</Text>}
                </View>
                <View style={styles.buttonWrapper}>
                  <Button
                    dark={inProgressNow}
                    raised
                    primary={inProgressNow}
                    theme={{ ...Theme, roundness: 20 }}
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
                    <Text>Start</Text>
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

class StudyFeed extends React.Component {
  render() {
    const { token, title, studies } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {studies.map((study, index) => (
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
  activeSurveyRow: {
    backgroundColor: `${Theme.colors.primary}10`,
  },
  surveyTitle: {
    fontWeight: 'bold',
  },
  inProgressText: {
    color: Theme.colors.primary,
    marginTop: 5,
  },
  contentWrapper: {
    flex: 1,
  },
  buttonWrapper: {
    marginLeft: 10,
  },
});

export default withNavigation(StudyFeed);
