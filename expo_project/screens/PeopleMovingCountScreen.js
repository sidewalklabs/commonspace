import { Icon } from 'expo';
import React from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from 'react-native';
import Selectable from '../components/Selectable';
import * as _ from 'lodash';
import Theme from '../constants/Theme';
import { Button, Card } from 'react-native-paper';
import QUESTION_CONFIG from '../config/peopleMovingQuestions';
import { getRandomIconColor } from '../utils/color';
import moment from 'moment';

import * as uuid from 'uuid';

class PeopleMovingCountSummary extends React.Component {
  render() {
    const { markers } = this.props;
    const primaryAttribute = QUESTION_CONFIG[0];
    const { options, questionKey } = primaryAttribute;
    const grouped = _.groupBy(markers, questionKey);
    return (
      <View style={styles.summaryContainer}>
        <View>
          <Text style={styles.title}>{markers.length}</Text>
          <Text style={styles.label}>People</Text>
        </View>
        <View style={styles.grid}>
          {_.map(options, option => {
            const optionSubset = grouped[option.value];
            const count = optionSubset ? optionSubset.length : 0;
            return (
              <View style={styles.gridRow}>
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
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => params.navigateToMarkerList()}
          style={{
            marginRight: 10,
          }}>
          <Icon.MaterialIcons name="people" size="30" color="white" />
        </TouchableOpacity>
      ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'Count',
      markers: [],
      selectedAttributes: _.reduce(
        QUESTION_CONFIG,
        (result, question) => {
          const { questionKey } = question;
          result[questionKey] = '';
          return result;
        },
        {},
      ),
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({
      navigateToMarkerList: this.navigateToMarkerList,
    });
    // TODO: Load all markers from study when mounting
  }

  syncMarkersWithListView = markers => {
    this.setState({ markers });
  };

  navigateToMarkerList = () => {
    // TODO: read this from study fields once available
    // TODO: swap out delete and update functions once backend is available
    const { token, surveyId } = this.props.navigation.state.params;
    this.props.navigation.navigate('MarkerListScreen', {
      token,
      surveyId,
      markers: this.state.markers,
      questions: QUESTION_CONFIG,
      onUpdate: () => console.log('update'),
      onDelete: () => console.log('update'),
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
      selectedAttributes[questionKey] = '';
    }
    this.setState({ selectedAttributes });
  };

  addMarker = () => {
    const { location } = this.state;
    const markersCopy = [...this.state.markers];
    const date = moment();
    const dateLabel = date.format('HH:mm');
    const dataPointId = uuid.v4();
    const previousColor = markersCopy.length ? markersCopy[markersCopy.length - 1].color : null;
    const color = getRandomIconColor([previousColor]);
    const title = `Person  ${markersCopy.length + 1}`;

    const marker = {
      dataPointId,
      location,
      color,
      title,
      dateLabel,
      ...this.state.selectedAttributes,
    };

    markersCopy.push(marker);
    this.setState({ markers: markersCopy });
    // TODO: add in backend
    // TODO: add error handling after incorporating backend
  };

  deleteLastMarker = () => {
    const markersCopy = [...this.state.markers];
    if (markersCopy.length) {
      // TODO: delete in backend
      // TODO: add error handling after incorporating backend
      const lastMarker = markersCopy.pop();
      this.setState({ markers: markersCopy });
    }
  };

  updateMarker = (dataPointId, questionKey, value) => {
    const markersCopy = [...this.state.markers];
    const marker = _.find(markersCopy, { dataPointId });
    if (marker) {
      marker[questionKey] = value;
      this.setState({ markers: markersCopy });
      // TODO: update in backend
      // TODO: add error handling after incorporating backend
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <PeopleMovingCountSummary markers={this.state.markers} />
        <Card style={styles.card} elevation={3}>
          <View style={styles.cardContent}>
            <ScrollView>
              <View onStartShouldSetResponder={() => true}>
                {_.map(QUESTION_CONFIG, question => {
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
              <Button
                style={styles.footerButton}
                raised
                uppercase={false}
                onPress={() => {
                  this.deleteLastMarker();
                }}
                theme={{ ...Theme, roundness: 20 }}>
                <Text>Undo</Text>
              </Button>
              <Button
                style={styles.footerButton}
                dark
                raised
                primary
                uppercase={false}
                onPress={() => {
                  this.addMarker();
                }}
                theme={{ ...Theme, roundness: 20 }}>
                <Text>Add</Text>
              </Button>
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
    padding: 20,
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
  },
  summaryContainer: {
    flexShrink: 0,
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
  grid: {
    flexBasis: 150,
    marginVertical: 10,
  },
  gridRow: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default PeopleMovingCountScreen;
