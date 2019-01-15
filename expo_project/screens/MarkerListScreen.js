import { Icon } from 'expo';
import React from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from 'react-native';
import Selectable from '../components/Selectable';
import * as _ from 'lodash';
import Theme from '../constants/Theme';
import { Card } from 'react-native-paper';
import Banner from '../components/Banner';
import PersonIcon from '../components/PersonIcon';

class MarkerRow extends React.Component {
  // TODO: add options sheet for deleting
  render() {
    const { marker, onUpdate, expanded, onDelete, onToggle, questions } = this.props;
    const { color, title, dateLabel, dataPointId } = marker;
    return (
      <Card
        key={expanded}
        elevation={expanded ? 3 : 0}
        style={[
          {
            flex: 1,
            padding: 0,
            marginHorizontal: 0,
            marginTop: 0,
            marginBottom: expanded ? 10 : 0,
            borderBottomColor: expanded ? 'transparent' : '#bbb',
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
        ]}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={() => onToggle(marker.dataPointId)}>
          <View style={{ flex: 1 }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 10,
              }}>
              <PersonIcon backgroundColor={color} size={40} />
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={[styles.label]}>{title}</Text>
                <Text>{dateLabel}</Text>
              </View>
            </View>
            {expanded && (
              <View style={{ paddingBottom: 10 }}>
                {_.map(questions, question => {
                  const { questionKey, questionLabel, options } = question;
                  return (
                    <Selectable
                      key={questionKey}
                      onSelectablePress={(value, buttonHeight) => {
                        onUpdate(dataPointId, questionKey, value);
                      }}
                      selectedValue={marker[questionKey]}
                      selectedColor={color}
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
  static navigationOptions = ({ navigation }) => ({
    headerTitle: 'Study List',
    headerLeft: (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          navigation.goBack();
        }}
        style={{
          marginLeft: 10,
        }}>
        <Icon.Feather name="arrow-left" size="30" color="white" />
      </TouchableOpacity>
    ),
  });

  constructor(props) {
    super(props);
    this.state = {
      expandedMarker: null,
    };
  }

  onToggle = dataPointId => {
    const expandedMarker = this.state.expandedMarker === dataPointId ? null : dataPointId;
    this.setState({ expandedMarker });
  };

  render() {
    const { markers, questions, onUpdate, onDelete } = this.props.navigation.state.params;

    return (
      <View style={styles.container}>
        {markers.length ? (
          <ScrollView style={{ flex: 1 }}>
            {_.map(markers, marker => {
              return (
                <MarkerRow
                  marker={marker}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  expanded={this.state.expandedMarker === marker.dataPointId}
                  onToggle={this.onToggle}
                  questions={questions}
                />
              );
            })}
          </ScrollView>
        ) : (
          <Banner
            title="Placeholder placeholder placeholder"
            description="Placeholder placeholder placeholder"
            cta="Try it out"
            ctaOnPress={() => this.props.navigation.goBack()}
          />
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
    display: 'flex',
    flex: 1,
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
    flexShrink: 0,
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
