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
import PersonIcon from '../components/PersonIcon';

import SegmentedControl from '../components/SegmentedControl';

import MapConfig from '../constants/Map';

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

class MarkerRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  toggleRow = () => {
    this.setState({ expanded: !this.state.expanded });
  };

  render() {
    const { marker, onUpdate } = this.props;
    const { color, title, dateLabel, dataPointId } = marker;
    return (
      <Card
        key={this.state.expanded}
        elevation={this.state.expanded ? 3 : 0}
        style={[
          {
            flex: 1,
            padding: 10,
            marginHorizontal: 0,
            marginTop: 0,
            marginBottom: this.state.expanded ? 10 : 0,
            borderBottomColor: this.state.expanded ? 'transparent' : '#bbb',
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
        ]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={this.toggleRow}>
          <View style={{ flex: 1 }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <PersonIcon backgroundColor={color} size={40} />
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={[styles.label]}>{title}</Text>
                <Text>{dateLabel}</Text>
              </View>
            </View>
            {this.state.expanded && (
              <View>
                {_.map(QUESTION_CONFIG, question => {
                  const { questionKey, questionLabel, options } = question;
                  return (
                    <Selectable
                      key={questionKey}
                      onSelectablePress={(value, buttonHeight) => {
                        onUpdate(dataPointId, questionKey, value);
                      }}
                      selectedValue={marker[questionKey]}
                      title={questionLabel}
                      options={options}
                    />
                  );
                })}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Card>
    );
  }
}

class PeopleMovingCountScreen extends React.Component {
  constructor(props) {
    super(props);
    // TODO: placeholder, replace with real location?
    const { latitude, longitude } = MapConfig.defaultRegion;
    this.state = {
      activeTab: 'Count',
      location: { latitude, longitude },
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

    // Placeholder for generating client side title
    // Once we pull in backend changes, we will generate these rather than saving them
    const primaryAttribute = QUESTION_CONFIG[0];
    const { questionKey } = primaryAttribute;
    const selectedPrimary = this.state.selectedAttributes[questionKey];
    const number = _.filter(this.state.markers, {
      [questionKey]: selectedPrimary,
    }).length;
    const title = `${selectedPrimary || 'Person'}  ${number}`;

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
  };

  updateMarker = (dataPointId, questionKey, value) => {
    const markersCopy = [...this.state.markers];
    const marker = _.find(markersCopy, { dataPointId });
    if (marker) {
      marker[questionKey] = value;
      this.setState({ markers: markersCopy });
    }
  };

  render() {
    const { activeTab } = this.state;
    return (
      <View style={styles.container}>
        <SegmentedControl
          labels={['Count', 'List']}
          activeTab={this.state.activeTab}
          onTabSelect={activeTab => this.setState({ activeTab })}
        />
        {this.state.activeTab === 'Count' && (
          <View style={styles.content}>
            <PeopleMovingCountSummary markers={this.state.markers} />
            <Card style={styles.card} elevation={3}>
              <View style={styles.cardContent}>
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
                <View style={styles.buttonWrapper}>
                  <Button
                    dark
                    raised
                    primary
                    onPress={() => {
                      this.addMarker();
                    }}
                    theme={{ ...Theme, roundness: 20 }}>
                    Add
                  </Button>
                </View>
              </View>
            </Card>
          </View>
        )}
        {this.state.activeTab === 'List' && (
          <ScrollView style={{ flex: 1 }}>
            {_.map(this.state.markers, marker => {
              return <MarkerRow marker={marker} onUpdate={this.updateMarker} />;
            })}
            {!this.state.markers.length && <Text>You have not counted any people.</Text>}
          </ScrollView>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
  },
  cardContent: {
    backgroundColor: `${Theme.colors.primary}10`,
  },
  buttonWrapper: {
    margin: 10,
  },
  tabs: {
    flex: 0,
    flexDirection: 'row',
  },
  tab: {
    padding: 20,
    flex: 1,
    borderBottomColor: '#bbb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomColor: Theme.colors.primary,
    borderBottomWidth: 2,
  },
  tabText: {
    fontWeight: 'bold',
    color: Theme.colors.primary,
  },
  summaryContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 80,
    color: Theme.colors.primary,
  },
  label: {
    fontWeight: 'bold',
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
