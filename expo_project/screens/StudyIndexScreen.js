import React from 'react';
import { AsyncStorage, ScrollView, StyleSheet, Text, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import Theme from '../constants/Theme';
import { Button, Caption, Card, CardContent, Divider, Title, Paragraph } from 'react-native-paper';

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
  }

  navigationOptions = {
    title: 'Studies',
  }

  _signOut = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  }

  async componentDidMount() {
    const userEmail = await AsyncStorage.getItem('userEmail');
    let studies = await getAuthorizedStudiesForEmail(firestore, userEmail);
    studies = await Promise.all(studies.map(async (study) => {
      try {
        study.surveys = await getSurveysForStudy(firestore, study.studyId);
      } catch (error) {
        console.error(error);
      }
      return study;
    }));
    this.setState({studies});
  }

  render() {
    return (
      <View style={[styles.container]}>
        <ScrollView style={[styles.container]} stickyHeaderIndices={[0]}>
          <Caption style={styles.sectionTitle}>Your studies</Caption>
          {this.state.studies.map(study => {
            const {studyId, title: studyName, authorName: studyAuthor, surveys} = study;
            return (
              <Card elevation={3} key={study.studyId}>
              <CardContent style={styles.studyHeader}>
                <Title>{studyName}</Title>
                <Paragraph>by {studyAuthor}</Paragraph>
              </CardContent>
              {surveys.map(survey => {
                const {surveyId, type: surveyType, title: surveyTitle } = survey;
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
                              surveyTitle
                            })
                          }>
                          Start
                        </Button>
                      </View>
                    </CardContent>
                  </View>
                );
              })}
            </Card>
          )})}
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
