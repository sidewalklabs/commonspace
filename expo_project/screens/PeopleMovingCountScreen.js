import { Icon } from 'expo';
import React from 'react';
import { Alert, StyleSheet, View, ScrollView, Text, TouchableOpacity } from 'react-native';
import * as _ from 'lodash';
import { Card } from 'react-native-paper';
import moment from 'moment';
import * as uuid from 'uuid';
import Selectable from '../components/Selectable';
import Theme from '../constants/Theme';
import { deleteDataPoint, getDataPointsforSurvey, saveNewDataPoint } from '../lib/commonsClient';
import QUESTION_CONFIG from '../config/peopleMovingQuestions';
import { getRandomIconColor } from '../utils/color';

class PeopleMovingCountSummary extends React.Component {
  render() {
    const { markers, primaryAttribute } = this.props;
    const { options, questionKey } = primaryAttribute;
    const grouped = _.groupBy(markers, questionKey);
    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCallout}>
          <Text style={styles.title} fontVariant="tabular-nums" numberOfLines={1}>
            {markers.length}
          </Text>
          <Text style={styles.label}>People</Text>
        </View>
        <View style={styles.grid}>
          {_.map(options, (option, index) => {
            const optionSubset = grouped[option.value];
            const count = optionSubset ? optionSubset.length : 0;
            return (
              <View key={index} style={styles.gridRow}>
                <Text style={styles.label}>{option.label}</Text>
                <Text style={styles.labelNumber}>{count}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }
}

class PeopleMovingCountScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: navigation.getParam('surveyTitle'),
      headerLeft: (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            navigation.goBack();
          }}
          style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              backgroundColor: 'white',
              paddingHorizontal: 15,
              paddingVertical: 5,
              borderRadius: 20,
              marginLeft: 10,
            }}>
            <Text
              style={{
                fontSize: 14,
                color: Theme.colors.primary,
                fontFamily: 'product-medium',
              }}>
              Exit
            </Text>
          </View>
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => params.navigateToMarkerList()}
          style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 12,
          }}>
          <Icon.MaterialIcons name="people" size={30} color="white" />
        </TouchableOpacity>
      ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      markers: [],
      token: props.navigation.state.params.token,
      studyFields: props.navigation.state.params.studyFields,
      selectedAttributes: {},
      surveyId: this.props.navigation.state.params.surveyId,
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({
      navigateToMarkerList: this.navigateToMarkerList,
    });
    const { surveyId, token } = this.state;
    getDataPointsforSurvey(token, surveyId).then(dataPoints => {
      const markers = dataPoints.map((d, i) => {
        const title = `Person ${i + 1}`;
        const color = getRandomIconColor();
        return {
          ...d,
          color,
          title,
        };
      });
      this.setState({ markers });
    });
  }

  syncMarkersWithListView = markers => {
    this.setState({ markers });
  };

  navigateToMarkerList = () => {
    const { token, surveyId, studyFields } = this.state;
    const questions = _.filter(
      QUESTION_CONFIG,
      ({ questionKey }) => studyFields.indexOf(questionKey) !== -1,
    );
    this.props.navigation.navigate('MarkerListScreen', {
      token,
      surveyId,
      markers: this.state.markers,
      questions,
      sync: this.syncMarkersWithListView,
      emptyTitle: 'Add people as they go by',
      emptyDescription:
        'Select attributes of the person you see, then tap add to make a record of them crossing your line of sight.',
    });
  };

  toggleValue = (questionKey, value) => {
    const selectedAttributes = { ...this.state.selectedAttributes };
    if (selectedAttributes[questionKey] !== value) {
      selectedAttributes[questionKey] = value;
    } else {
      delete selectedAttributes[questionKey];
    }
    this.setState({ selectedAttributes });
  };

  addMarker = () => {
    const { selectedAttributes, surveyId, token } = this.state;
    const markersCopy = [...this.state.markers];
    const date = moment();
    const dataPointId = uuid.v4();
    const previousColor = markersCopy.length ? markersCopy[markersCopy.length - 1].color : null;
    const color = getRandomIconColor([previousColor]);
    const title = `Person  ${markersCopy.length + 1}`;

    const marker = {
      dataPointId,
      color,
      title,
      creationDate: date.toISOString(),
      ...selectedAttributes,
    };

    markersCopy.push(marker);
    const oldMarkers = this.state.markers;
    this.setState({ markers: markersCopy });
    if (surveyId !== 'DEMO') {
      saveNewDataPoint(token, surveyId, marker).catch(error => {
        Alert.alert('Error', error.message, [{ text: 'OK' }]);
        this.setState({ markers: oldMarkers });
      });
    }
  };

  deleteLastMarker = () => {
    if (this.state.markers.length) {
      const { surveyId, token } = this.state;
      const markersCopy = [...this.state.markers];

      const markerToRemove = _.last(markersCopy);
      const { dataPointId } = markerToRemove;

      const oldMarkers = [...this.state.markers];
      const newMarkers = _.reject(this.state.markers, {
        dataPointId,
      });

      this.setState({
        markers: newMarkers,
      });

      if (dataPointId && surveyId !== 'DEMO') {
        deleteDataPoint(token, surveyId, dataPointId).catch(error => {
          Alert.alert('Error', e.message, [{ text: 'OK' }]);
          this.setState({
            markers: oldMarkers,
          });
        });
      }
    }
  };

  render() {
    const { studyFields, markers } = this.state;
    const questions = _.filter(
      QUESTION_CONFIG,
      ({ questionKey }) => studyFields.indexOf(questionKey) !== -1,
    );

    return (
      <View style={styles.container}>
        <PeopleMovingCountSummary markers={markers} primaryAttribute={questions[0]} />
        <Card style={styles.card} elevation={3}>
          <View style={styles.cardContent}>
            <ScrollView>
              <View onStartShouldSetResponder={() => true}>
                {_.map(questions, question => {
                  const { questionKey, questionLabel, options } = question;
                  return (
                    <Selectable
                      key={questionKey}
                      onSelectablePress={(value, buttonHeight) => {
                        this.toggleValue(questionKey, value);
                      }}
                      selectedValue={this.state.selectedAttributes[questionKey]}
                      title={questionLabel}
                      options={options}
                    />
                  );
                })}
              </View>
            </ScrollView>
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={[
                  styles.footerButton,
                  { borderWidth: StyleSheet.hairlineWidth, borderColor: '#bbb' },
                ]}
                onPress={() => {
                  this.deleteLastMarker();
                }}>
                <Text>Undo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footerButton, { backgroundColor: Theme.colors.primary }]}
                onPress={() => {
                  this.addMarker();
                }}>
                <Text style={{ color: 'white' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    flex: 1,
    display: 'flex',
  },
  cardContent: {
    flex: 1,
    backgroundColor: `${Theme.colors.primary}10`,
  },
  buttonWrapper: {
    margin: 10,
    display: 'flex',
    flex: 0,
    flexDirection: 'row',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 5,
    fontFamily: 'product-bold',
    borderRadius: 20,
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    flexShrink: 0,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 80,
    color: Theme.colors.primary,
  },
  label: {
    fontFamily: 'product-medium',
  },
  labelNumber: { color: Theme.colors.primary },
  summaryCallout: {
    flexShrink: 0,
    flexGrow: 1,
    marginRight: 10,
  },
  grid: {
    flexShrink: 1,
    flexGrow: 0,
    flexBasis: 140,
    marginVertical: 10,
  },
  gridRow: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default PeopleMovingCountScreen;
