import { Icon } from 'expo';
import React from 'react';
import {
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
} from 'react-native';
import * as _ from 'lodash';
import { Card } from 'react-native-paper';
import moment from 'moment';
import Selectable from '../components/Selectable';
import Banner from '../components/Banner';
import PersonIcon from '../components/PersonIcon';
import MarkerMenu from '../components/MarkerMenu';
import BackArrow from '../components/BackArrow';
import { deleteDataPoint, updateDataPoint } from '../lib/commonsClient';

class MarkerRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsibleContentHeight: 0,
      collapsibleCurrentHeight: 'auto',
    };

    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.expanded !== prevProps.expanded) {
      const collapsedHeight = 0;
      const expandedHeight = collapsedHeight + this.state.collapsibleContentHeight;
      const toValue = this.props.expanded ? expandedHeight : collapsedHeight;
      LayoutAnimation.easeInEaseOut();
      this.setState({ collapsibleCurrentHeight: toValue });
    }
  }

  setCollapsibleContentHeight = event => {
    const collapsibleContentHeight = event.nativeEvent.layout.height;
    this.setState({ collapsibleContentHeight, collapsibleCurrentHeight: 0 });
  };

  onSelectPress = (dataPointId, key, value) => {
    this.props.onUpdate(dataPointId, key, value);
  };

  onMultiselectPress = (dataPointId, key, value, selectedValue) => {
    const valueArray = selectedValue || [];
    // if value is already selected, deselect it.
    // else, select it
    if (_.includes(valueArray, value)) {
      _.pull(valueArray, value);
    } else {
      valueArray.push(value);
    }
    this.props.onUpdate(dataPointId, key, valueArray);
  };

  render() {
    const { marker, expanded, onToggle, questions, onMenuButtonPress } = this.props;
    const { color, title, creationDate, dataPointId } = marker;
    const dateLabel = moment(creationDate).format('HH:mm');
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
          <View
            style={{
              flex: 0,
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
            <TouchableOpacity
              activeOpacity={1}
              onPress={e => {
                const { pageY } = e.nativeEvent;
                onMenuButtonPress(marker.dataPointId, pageY + 5);
              }}>
              <Icon.MaterialCommunityIcons name="dots-vertical" color="#787878" size={24} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 0, height: this.state.collapsibleCurrentHeight }}>
            <View
              style={[
                {
                  paddingBottom: 10,
                },
                !this.state.collapsibleContentHeight && { position: 'absolute', top: -10000 },
              ]}
              onLayout={
                !this.state.collapsibleContentHeight ? this.setCollapsibleContentHeight : undefined
              }>
              {_.map(questions, question => {
                const { questionKey, questionLabel, questionType, options } = question;
                const selectedValue = marker[questionKey];
                return (
                  <Selectable
                    key={questionKey}
                    onSelectablePress={(value, buttonHeight) => {
                      questionType === 'multiselect'
                        ? this.onMultiselectPress(dataPointId, questionKey, value, selectedValue)
                        : this.onSelectPress(dataPointId, questionKey, value);
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
      headerLeft: <BackArrow goBack={params.syncAndGoBack} />,
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
    const { token, surveyId } = this.props.navigation.state.params;

    const markersCopy = [...this.state.markers];
    const marker = _.find(markersCopy, { dataPointId });

    if (marker) {
      const oldMarkerValue = marker[questionKey];
      marker[questionKey] = value;
      this.setState({
        markers: markersCopy,
      });

      if (surveyId !== 'DEMO') {
        updateDataPoint(token, surveyId, marker).catch(error => {
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
    const { token, surveyId } = this.props.navigation.state.params;
    const markers = _.reject(this.state.markers, { dataPointId });
    this.setState({ markers });

    if (surveyId !== 'DEMO') {
      deleteDataPoint(token, surveyId, dataPointId).catch(error => {
        Alert.alert('Error', 'Something went wrong removing datapoint. Please try again later.', [
          { text: 'OK' },
        ]);
      });
    }
  };

  onMenuButtonPress = (markerMenuMarkerId, markerMenuTopLocation) => {
    this.setState({ markerMenuMarkerId, markerMenuTopLocation });
  };

  _keyExtractor = (marker, index) => marker.dataPointId;

  _renderItem = ({ item: marker }) => (
    <MarkerRow
      marker={marker}
      onUpdate={this.onUpdate}
      onMenuButtonPress={this.onMenuButtonPress}
      expanded={this.state.expandedMarkerId === marker.dataPointId}
      onToggle={this.onToggle}
      questions={this.props.navigation.state.params.questions}
    />
  );

  render() {
    const { emptyTitle, emptyDescription } = this.props.navigation.state.params;
    // render in reverse so most recent markers are at the top
    const reveresedMarkers = _.reverse([...this.state.markers]);
    const { markerMenuMarkerId } = this.state;

    return (
      <View style={styles.container}>
        {this.state.markers.length ? (
          <View style={{ flex: 1 }}>
            <FlatList
              data={reveresedMarkers}
              extraData={this.state}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
            />
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
          </View>
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
  label: {
    fontFamily: 'product-medium',
  },
});

export default MarkerListScreen;
