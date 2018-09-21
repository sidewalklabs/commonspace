import React from 'react';
import { ActivityIndicator, AsyncStorage, ScrollView, StyleSheet, Text, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import Theme from '../constants/Theme';
import { Button, Card, CardContent, Divider, Title, Paragraph } from 'react-native-paper';

import { firestore } from '../lib/firebaseSingleton';
import { getAuthorizedStudiesForEmail, getSurveysForStudy } from '../lib/firestore';

function typeToRouteName(type) {
  switch (type) {
    case 'activity':
      return 'SurveyScreen';
    default:
      return 'ComingSoonScreen';
  }
}

class SurveyIndexScreen extends React.Component {
  state = {
    studies: [],
    loading: true,
  };

  static navigationOptions = {
    headerTitle: 'Your Studies',
  };

  _signOut = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  };

  async componentDidMount() {
    const userEmail = await AsyncStorage.getItem('userEmail');
    let studies = await getAuthorizedStudiesForEmail(firestore, userEmail);
    studies = await Promise.all(
      studies.map(async study => {
        try {
          study.surveys = await getSurveysForStudy(firestore, study.studyId, userEmail);
        } catch (error) {
          console.error(error);
        }
        return study;
      }),
    );
    this.setState({ studies, loading: false });
  }

  render() {
    return (
      <View style={[styles.container]}>
        <ScrollView style={[styles.container]}>
          {this.state.loading && <ActivityIndicator />}
          {this.state.studies.map(study => {
            const { studyId, title: studyName, authorName: studyAuthor, surveys } = study;
            // TODO: move these to backend
            const authorUrl = 'https://parkpeople.ca/';
            const studyInstructions =
              'You will be using Commons to collect observational data about what public activities people are doing in Thorncliffe Park. Following the study, a report will be made available online.';
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
                  const { surveyId, type: surveyType, title: surveyTitle, locationId } = survey;
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
                              this.props.navigation.navigate(typeToRouteName(surveyType), {
                                studyId,
                                surveyId,
                                studyName,
                                studyAuthor,
                                surveyType,
                                surveyTitle,
                                locationId,
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
        <Button raised primary dark theme={{ ...Theme, roundness: 100 }} onPress={this._signOut}>
          Log Out
        </Button>
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

export default withNavigation(SurveyIndexScreen);
