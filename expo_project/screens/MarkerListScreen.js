import { Icon } from 'expo';
import React from 'react';
import {
  Animated,
  Alert,
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import Selectable from '../components/Selectable';
import * as _ from 'lodash';
import Theme from '../constants/Theme';
import { Card } from 'react-native-paper';
import Banner from '../components/Banner';
import PersonIcon from '../components/PersonIcon';
import MarkerMenu from '../components/MarkerMenu';

class MarkerRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsibleHeaderHeight: 0,
      collapsibleContentHeight: 0,
      animation: new Animated.Value(),
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.expanded !== prevProps.expanded) {
      const collapsedHeight = this.state.collapsibleHeaderHeight;
      const expandedHeight = collapsedHeight + this.state.collapsibleContentHeight;

      const currentHeightValue = prevProps.expanded ? expandedHeight : collapsedHeight;
      const toValue = this.props.expanded ? expandedHeight : collapsedHeight;

      this.state.animation.setValue(currentHeightValue);
      Animated.timing(this.state.animation, {
        toValue,
        duration: 200,
      }).start();
    }
  }

  setCollapsibleHeaderHeight = event => {
    const collapsibleHeaderHeight = event.nativeEvent.layout.height;
    this.setState({ collapsibleHeaderHeight });
    if (!this.props.expanded) {
      // set initial value to header height
      this.state.animation.setValue(collapsibleHeaderHeight);
    }
  };

  setCollapsibleContentHeight = event => {
    const collapsibleContentHeight = event.nativeEvent.layout.height;
    this.setState({ collapsibleContentHeight });
  };

  render() {
    const { marker, onUpdate, expanded, onToggle, questions, onMenuButtonPress } = this.props;
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
          <Animated.View style={[{ overflow: 'hidden', height: this.state.animation }]}>
            <View
              style={{
                flex: 0,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 10,
              }}
              onLayout={
                !this.state.collapsibleHeaderHeight ? this.setCollapsibleHeaderHeight : undefined
              }>
              <PersonIcon backgroundColor={color} size={40} />
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={[styles.label]}>{title}</Text>
                <Text>{dateLabel}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={1}
                onPress={e => {
                  const { pageY } = e.nativeEvent;
                  onMenuButtonPress(marker.dataPointId, pageY + 5);
                }}>
                <Icon.MaterialCommunityIcons name="dots-vertical" color="#787878" size={24} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 0, paddingBottom: 10, overflow: 'hidden' }}>
              <View
                onLayout={
                  !this.state.collapsibleContentHeight
                    ? this.setCollapsibleContentHeight
                    : undefined
                }>
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
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Card>
    );
  }
}

class MarkerListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: 'Study List',
      headerLeft: (
        <TouchableOpacity
          activeOpacity={1}
          onPress={params.syncAndGoBack}
          style={{
            marginLeft: 10,
          }}>
          <Icon.Feather name="arrow-left" size="30" color="white" />
        </TouchableOpacity>
      ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      markers: [],
      expandedMarkerId: null,
      markerMenuMarkerId: null,
      markerMenuTopLocation: null,
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({
      syncAndGoBack: this.syncAndGoBack,
    });

    const markers = this.props.navigation.getParam('markers', []);
    this.setState({ markers });
  }

  syncAndGoBack = () => {
    this.props.navigation.state.params.sync(this.state.markers);
    this.props.navigation.goBack();
  };

  onToggle = dataPointId => {
    const expandedMarkerId = this.state.expandedMarkerId === dataPointId ? null : dataPointId;
    this.setState({ expandedMarkerId });
  };

  onUpdate = (dataPointId, questionKey, value) => {
    const { token, surveyId, onUpdate } = this.props.navigation.state.params;

    const markersCopy = [...this.state.markers];
    const marker = _.find(markersCopy, { dataPointId });

    if (marker) {
      const oldMarkerValue = marker[questionKey];
      marker[questionKey] = value;
      this.setState({
        markers: markersCopy,
      });

      if (surveyId !== 'DEMO') {
        onUpdate(token, surveyId, marker).catch(error => {
          Alert.alert(
            'Error',
            'Something went wrong while updating marker. Please try again later.',
            [{ text: 'OK' }],
          );

          marker[questionKey] = oldMarkerValue;
          this.setState({
            markers: markersCopy,
          });
        });
      }
    }
  };

  onDelete = dataPointId => {
    const { token, surveyId, onDelete } = this.props.navigation.state.params;
    const markers = _.reject(this.state.markers, { dataPointId });
    this.setState({ markers });

    if (surveyId !== 'DEMO') {
      onDelete(token, surveyId, dataPointId).catch(function(error) {
        Alert.alert('Error', 'Something went wrong removing datapoint. Please try again later.', [
          { text: 'OK' },
        ]);
      });
    }
  };

  onMenuButtonPress = (markerMenuMarkerId, markerMenuTopLocation) => {
    this.setState({ markerMenuMarkerId, markerMenuTopLocation });
  };

  render() {
    const { questions, emptyTitle, emptyDescription } = this.props.navigation.state.params;
    // render in reverse so most recent markers are at the top
    const reveresedMarkers = _.reverse([...this.state.markers]);
    const { expandedMarkerId, markerMenuMarkerId } = this.state;

    return (
      <View style={styles.container}>
        {this.state.markers.length ? (
          <ScrollView style={{ flex: 1 }}>
            {_.map(reveresedMarkers, marker => {
              return (
                <MarkerRow
                  marker={marker}
                  onUpdate={this.onUpdate}
                  onMenuButtonPress={this.onMenuButtonPress}
                  expanded={expandedMarkerId === marker.dataPointId}
                  onToggle={this.onToggle}
                  questions={questions}
                />
              );
            })}
            {this.state.markerMenuTopLocation && (
              <MarkerMenu
                topLocation={this.state.markerMenuTopLocation}
                onDeletePress={() => {
                  this.onDelete(markerMenuMarkerId);
                }}
                onClose={() => {
                  this.setState({ markerMenuTopLocation: null });
                }}
              />
            )}
          </ScrollView>
        ) : (
          <Banner
            title={emptyTitle}
            description={emptyDescription}
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
    fontFamily: 'roboto-medium',
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

export default MarkerListScreen;
