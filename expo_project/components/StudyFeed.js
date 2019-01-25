import { WebBrowser } from 'expo';
import React from 'react';
import { ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Button, Card, CardContent, Divider, Title, Paragraph } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
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
    if (uri) {
      return await WebBrowser.openBrowserAsync(uri);
    }
  };

  getIndicatorLabel = () => {
    const { type, isDemo } = this.props.study;
    if (isDemo) {
      return 'Demo';
    } else if (type === 'stationary') {
      return 'Activity Map';
    } else {
      return 'Moving Count';
    }
  };

  render() {
    const { token, study } = this.props;
    const {
      description,
      title: studyName,
      type: studyType,
      authorName,
      authorUrl,
      surveys,
      fields: studyFields,
    } = study;
    // TODO: move these to backend
    const studyAuthor = authorName || 'Unknown author';
    return (
      <Card elevation={2} style={styles.card}>
        <CardContent style={styles.studyHeader}>
          <Text style={styles.studyIndicator}>{this.getIndicatorLabel().toUpperCase()}</Text>
          <Text style={styles.studyTitle}>{studyName}</Text>
          <View style={{ flexDirection: 'row', marginTop: 4 }}>
            <Image
              source={require('../assets/images/icon-info-circle.png')}
              style={{ width: 20, height: 20, marginRight: 8, opacity: 0.5 }}
            />
            <Text style={styles.studySubtitle} onPress={() => this._openLink(authorUrl)}>
              {studyAuthor}
            </Text>
          </View>
          {description && <Text style={styles.studyDescription}>{description}</Text>}
        </CardContent>
        {surveys.map(survey => {
          const {
            survey_id: surveyId,
            survey_title: surveyTitle = 'Unnamed Survey',
            survey_location: zoneFeatureGeoJson,
          } = survey;
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
                    primary
                    theme={{ ...Theme, roundness: 20 }}
                    style={styles.surveyButton}
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
                    <Text style={styles.surveyButtonText}>Start</Text>
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
    backgroundColor: '#FAFAFA',
    flex: 1,
  },
  scrollContainer: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  card: {
    marginBottom: 12,
    marginLeft: 14,
    marginRight: 14,
  },
  studyHeader: {
    paddingBottom: 8,
  },
  studyIndicator: {
    fontFamily: 'product-bold',
    fontSize: 12,
    lineHeight: 24,
    color: Theme.colors.primary,
  },
  studyTitle: {
    fontFamily: 'product-bold',
    fontSize: 20,
    color: 'rgba(0,0,0,0.8)',
  },
  studySubtitle: {
    flex: 1,
    color: 'rgba(0,0,0,0.6)',
    fontFamily: 'product-regular',
    lineHeight: 20,
    marginBottom: 4,
  },
  studyDescription: {
    color: 'rgba(0,0,0,0.6)',
    fontFamily: 'product-regular',
    lineHeight: 20,
    marginBottom: 4,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 14,
    fontFamily: 'product-medium',
    color: 'rgba(0,0,0,0.6)',
    marginLeft: 16,
    marginRight: 16,
  },
  sectionDescription: {
    marginVertical: 10,
  },
  sectionDivider: {
    marginVertical: 4,
  },
  surveyRow: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  surveyButton: {
    borderWidth: 1.5,
    borderColor: `${Theme.colors.primary}50`,
  },
  surveyButtonText: {
    fontFamily: 'product-bold',
    color: Theme.colors.primary,
  },
  activeSurveyRow: {
    backgroundColor: `${Theme.colors.primary}10`,
  },
  surveyTitle: {
    fontSize: 16,
    fontFamily: 'product-bold',
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
