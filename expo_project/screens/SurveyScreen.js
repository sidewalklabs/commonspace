import { Icon } from 'expo';
import React from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Paragraph, Divider } from 'react-native-paper';
import { withNavigation } from 'react-navigation';
import * as _ from 'lodash';
import moment from 'moment';
import MapWithMarkers from '../components/MapWithMarkers';
import PersonIcon from '../components/PersonIcon';
import Survey from '../components/Survey';
import Layout from '../constants/Layout';
import { firestore } from '../lib/firebaseSingleton';
import * as uuid from 'uuid';

import Theme from '../constants/Theme';
import NoteModal from '../components/NoteModal';
import MarkerMenu from '../components/MarkerMenu';

import { getRandomIconColor } from '../utils/color';

// TODO (Ananta): shouold be dynamically set
const MIN_DRAWER_TRANSLATE_Y = 0;
const MID_DRAWER_TRANSLATE_Y = Layout.drawer.height - 300;
const MAX_DRAWER_TRANSLATE_Y = Layout.drawer.height - 100; // mostly collapsed, with just the header peaking out
const INITIAL_DRAWER_TRANSLATE_Y = MAX_DRAWER_TRANSLATE_Y;

class Indicator extends React.Component {
  render() {
    return <View style={styles.indicator} />;
  }
}

class Instructions extends React.Component {
  render() {
    return (
      <View style={styles.instructionsContainer}>
        <View style={styles.instructionsIcon}>
          <Icon.Ionicons name="md-finger-print" color="#787878" size={24} />
        </View>
        <View style={styles.instructions}>
          <Paragraph>Hold down your finger on the map to create a new marker</Paragraph>
        </View>
      </View>
    );
  }
}

class SurveyScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: navigation.getParam('surveyTitle'),
    headerLeft: (
      <TouchableOpacity
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
            fontWeight: 'bold',
          }}>
          Exit
        </Text>
      </TouchableOpacity>
    ),
  });

  constructor(props) {
    super(props);

    this.firestore = firestore;

    this.state = {
      activeMarkerId: null,
      markers: [],
      zoneLatLngs: [],
      markerMenuTopLocation: undefined,
      noteModalVisible: false,
      formScrollPosition: 0,
      pan: new Animated.ValueXY({ x: 0, y: INITIAL_DRAWER_TRANSLATE_Y }),
    };
    this._drawerY = INITIAL_DRAWER_TRANSLATE_Y;
    this.state.pan.addListener(value => (this._drawerY = value.y));

    this.resetDrawer = this.resetDrawer.bind(this);
    this.getToggleDirection = this.getToggleDirection.bind(this);
    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.selectMarker = this.selectMarker.bind(this);
    this.deleteMarker = this.deleteMarker.bind(this);
    this.createNewMarker = this.createNewMarker.bind(this);
    this.duplicateMarker = this.duplicateMarker.bind(this);
    this.setMarkerLocation = this.setMarkerLocation.bind(this);
    this.setFormResponse = this.setFormResponse.bind(this);
  }

  componentDidMount() {
    // Query for saved data
    const studyId = this.props.navigation.getParam('studyId');
    const surveyId = this.props.navigation.getParam('surveyId');
    const locationId = this.props.navigation.getParam('locationId');

    this.firestore
      .collection('study')
      .doc(studyId)
      .collection('location')
      .doc(locationId)
      .get()
      .then(o => {
        const coordinates = JSON.parse(o.data().geometry.coordinates);
        const zoneLatLngs = _.map(coordinates, c => ({
          longitude: c[0],
          latitude: c[1],
        }));
        this.setState({ zoneLatLngs });
      });

    this.firestore
      .collection('study')
      .doc(studyId)
      .collection('survey')
      .doc(surveyId)
      .collection('dataPoints')
      .get()
      .then(querySnapshot => {
        const markers = [];

        querySnapshot.forEach(function(doc) {
          const marker = doc.data();
          markers.push(marker);
        });
        if (markers.length) {
          // Sort by time string then title (since many markers have the same time string)
          const sortedMarkers = _.sortBy(markers, [
            marker => moment(marker.dateLabel, 'HH:mm').unix(),
            'title',
          ]);
          const { dataPointId: activeMarkerId } = _.last(sortedMarkers);
          this.setState({ markers: sortedMarkers, activeMarkerId });
        }
      });
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => false,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        // This method captures gestures, (which means the scrollview will not scroll)
        // For drags that should not block other gesture responses, use onMoveShouldSetPanResponder instead
        const verticalDistance = Math.abs(gestureState.dy);
        const horizontalDistance = Math.abs(gestureState.dx);
        const isVerticalPan = verticalDistance > horizontalDistance;

        if (isVerticalPan) {
          const directionUp = gestureState.dy < 0;
          if (directionUp) {
            // Respond to upward drags so long as there is room to expand the drawer
            const hasSpaceToPanUp = this._drawerY > MIN_DRAWER_TRANSLATE_Y;
            return hasSpaceToPanUp;
          } else {
            // Respond to downward drags if they are a long distance / high velocity or the scrollview is at the top
            const hasSpaceToPanDown = this._drawerY <= MAX_DRAWER_TRANSLATE_Y;
            const isScrolledToTop = !this.state.formScrollPosition;
            const isHeavyScroll = Math.abs(gestureState.dy) > 80 || Math.abs(gestureState.vy) > 1.2;
            return hasSpaceToPanDown && (isScrolledToTop || isHeavyScroll);
          }
        }
        return false;
      },
      // set store current value as offset, and set value to 0,
      // since onPanResponderMove converts delta offset into value and starts from 0 on every new gesture
      onPanResponderGrant: (evt, gestureState) => {
        this.state.pan.setOffset({ x: 0, y: this.state.pan.y._value });
        this.state.pan.setValue({ x: 0, y: 0 });
      },
      // Follow the gesture
      onPanResponderMove: Animated.event([null, { dy: this.state.pan.y }]),

      // Snap to a breakpoint when the gesture is release
      onPanResponderRelease: (evt, gestureState) => {
        // look at velocity on release, instead of direction
        // If user wiggles back and forth, we want to snap in the direction of terminal velocity
        const directionUp = gestureState.vy < 0;
        this.state.pan.flattenOffset();
        const y = directionUp ? MIN_DRAWER_TRANSLATE_Y : MAX_DRAWER_TRANSLATE_Y;

        Animated.spring(this.state.pan, {
          toValue: {
            x: 0,
            y,
          },
          useNativeDriver: true,
          friction: 6,
        }).start(() => this.setState(this.state));

        if (this.state.formScrollPosition) {
          this.scrollView.scrollTo({
            y: 0,
            animated: false,
          });
        }
      },
    });
  }

  getToggleDirection() {
    const direction = this._drawerY === MIN_DRAWER_TRANSLATE_Y ? 'down' : 'up';
    return direction;
  }

  toggleDrawer() {
    const y =
      this.getToggleDirection() === 'down' ? MAX_DRAWER_TRANSLATE_Y : MIN_DRAWER_TRANSLATE_Y;
    Animated.timing(this.state.pan, {
      toValue: { x: 0, y },
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // hack to trigger a re-render
      this.setState(this.state);
    });

    if (this.state.formScrollPosition) {
      this.scrollView.scrollTo({ y: 0, animated: false });
    }
  }

  resetDrawer(y = MID_DRAWER_TRANSLATE_Y) {
    if (this._drawerY !== y && this.state.markers.length) {
      Animated.timing(this.state.pan, {
        toValue: { x: 0, y },
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    if (this.state.formScrollPosition) {
      this.scrollView.scrollTo({ y: 0, animated: false });
    }
  }

  setFormResponse(dataPointId, key, value, heightToScroll) {
    const markersCopy = [...this.state.markers];
    const marker = _.find(markersCopy, { dataPointId });
    const studyId = this.props.navigation.getParam('studyId');
    const surveyId = this.props.navigation.getParam('surveyId');

    if (marker) {
      marker[key] = value;
      this.setState({
        markers: markersCopy,
      });
      this.firestore
        .collection('study')
        .doc(studyId)
        .collection('survey')
        .doc(surveyId)
        .collection('dataPoints')
        .doc(dataPointId)
        .set(marker);

      if (heightToScroll) {
        const currentScrollPosition = this.state.formScrollPosition;
        const currentDrawerOffset = this._drawerY;
        const newDrawerOffset = currentDrawerOffset - heightToScroll;

        if (newDrawerOffset >= MIN_DRAWER_TRANSLATE_Y) {
          Animated.timing(this.state.pan, {
            toValue: { x: 0, y: newDrawerOffset },
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else if (currentDrawerOffset > MIN_DRAWER_TRANSLATE_Y) {
          // Animate drawer to the top
          // then scroll the remaining amount to ensure next question is visible
          const remainder = currentDrawerOffset - MIN_DRAWER_TRANSLATE_Y;
          Animated.timing(this.state.pan, {
            toValue: { x: 0, y: MIN_DRAWER_TRANSLATE_Y },
            duration: 200,
            useNativeDriver: true,
          }).start();
          this.scrollView.scrollTo({
            y: currentScrollPosition + heightToScroll - remainder,
          });
        } else {
          this.scrollView.scrollTo({
            y: currentScrollPosition + heightToScroll,
          });
        }
      }
    }
  }

  deleteMarker(dataPointId) {
    const studyId = this.props.navigation.getParam('studyId');
    const surveyId = this.props.navigation.getParam('surveyId');

    this.firestore
      .collection('study')
      .doc(studyId)
      .collection('survey')
      .doc(surveyId)
      .collection('dataPoints')
      .doc(dataPointId)
      .delete()
      .then(() => {
        // this callback is called regardless of whether a marker is deleted or not :/
        const newMarkers = _.reject(this.state.markers, {
          dataPointId,
        });
        const newActiveMarkerId = newMarkers.length
          ? newMarkers[newMarkers.length - 1].dataPointId
          : null;
        this.setState({
          markers: newMarkers,
          activeMarkerId: newActiveMarkerId,
        });
      })
      .catch(function(error) {
        console.error('Error removing document: ', error);
      });
    this.resetDrawer(MAX_DRAWER_TRANSLATE_Y);
  }

  duplicateMarker(originalDataPointId) {
    const studyId = this.props.navigation.getParam('studyId');
    const surveyId = this.props.navigation.getParam('surveyId');
    const markersCopy = [...this.state.markers];
    const markerToCopy = _.find(markersCopy, {
      dataPointId: originalDataPointId,
    });

    if (markerToCopy) {
      const date = moment();
      const dateLabel = date.format('HH:mm');
      const title = 'Person ' + (markersCopy.length + 1);
      const dataPointId = uuid.v4();
      const color = getRandomIconColor();

      const duplicateMarker = {
        ...markerToCopy,
        dataPointId,
        color,
        title,
        dateLabel,
      };

      this.firestore
        .collection('study')
        .doc(studyId)
        .collection('survey')
        .doc(surveyId)
        .collection('dataPoints')
        .doc(dataPointId)
        .set(duplicateMarker)
        .then(doc => {
          markersCopy.push(duplicateMarker);
          this.setState({
            markers: markersCopy,
            activeMarkerId: dataPointId,
          });
        });
    }
  }

  selectMarker(activeMarkerId) {
    if (activeMarkerId === this.state.activeMarkerId) {
      this.toggleDrawer();
    } else {
      this.setState({ activeMarkerId });
      this.resetDrawer(MIN_DRAWER_TRANSLATE_Y);
    }
  }

  createNewMarker(location, color) {
    const studyId = this.props.navigation.getParam('studyId');
    const surveyId = this.props.navigation.getParam('surveyId');
    const markersCopy = [...this.state.markers];
    const date = moment();
    const dateLabel = date.format('HH:mm');
    const title = 'Person ' + (markersCopy.length + 1);
    const dataPointId = uuid.v4();

    const marker = {
      dataPointId,
      location,
      color,
      title,
      dateLabel,
    };

    // TODO (Seabass or Ananta): Figure out a way to get faster UI feedback
    // Would be nice for UI to optimistically render before firestore returns
    this.firestore
      .collection('study')
      .doc(studyId)
      .collection('survey')
      .doc(surveyId)
      .collection('dataPoints')
      .doc(dataPointId)
      .set(marker)
      .then(doc => {
        markersCopy.push(marker);
        this.setState({ markers: markersCopy, activeMarkerId: dataPointId }, this.resetDrawer);
      });
  }

  setMarkerLocation(dataPointId, location) {
    const studyId = this.props.navigation.getParam('studyId');
    const surveyId = this.props.navigation.getParam('surveyId');
    const markersCopy = [...this.state.markers];
    const marker = _.find(markersCopy, { dataPointId });

    if (marker) {
      marker.location = location;
      this.setState({
        markers: markersCopy,
      });

      this.firestore
        .collection('study')
        .doc(studyId)
        .collection('survey')
        .doc(surveyId)
        .collection('dataPoints')
        .doc(dataPointId)
        .update({ location: marker.location });
    }
  }

  render() {
    const { activeMarkerId, markers } = this.state;
    const activeMarker = _.find(markers, { dataPointId: activeMarkerId });
    const note = _.get(activeMarker, 'note', '');
    const noteButtonLabel = note ? 'Edit note' : 'Add note';
    const direction = this.getToggleDirection();
    const chevronIconName = `ios-arrow-${direction}`;

    return (
      <View style={styles.container}>
        <MapWithMarkers
          onMapPress={this.resetDrawer}
          onMapLongPress={this.createNewMarker}
          activeMarkerId={this.state.activeMarkerId}
          markers={this.state.markers}
          zoneLatLngs={this.state.zoneLatLngs}
          onMarkerPress={this.selectMarker}
          onMarkerDragEnd={this.setMarkerLocation}
        />
        <Animated.View
          style={[styles.drawer, { transform: this.state.pan.getTranslateTransform() }]}
          {...this._panResponder.panHandlers}>
          <TouchableOpacity
            style={[styles.drawerHeader]}
            activeOpacity={1}
            onPress={this.toggleDrawer}>
            <Indicator onPress={this.toggleDrawer} />

            {activeMarker && (
              <View style={styles.headerContent}>
                <View style={styles.personIconWrapper}>
                  <PersonIcon backgroundColor={activeMarker.color} size={50} />
                </View>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{activeMarker.title}</Text>
                  <Text>{activeMarker.dateLabel}</Text>
                </View>
                <TouchableOpacity
                  style={styles.markerMenuButton}
                  activeOpacity={1}
                  onPress={e => {
                    const { pageY } = e.nativeEvent;
                    this.setState({
                      markerMenuTopLocation: pageY - 120,
                    });
                  }}>
                  <Icon.MaterialCommunityIcons name="dots-vertical" color="#787878" size={24} />
                </TouchableOpacity>
                <View style={styles.chevron}>
                  <Icon.Ionicons name={chevronIconName} color="#D8D8D8" size={30} />
                </View>
              </View>
            )}
            {!activeMarker && <Instructions />}
          </TouchableOpacity>
          {activeMarker && (
            <ScrollView
              style={styles.formContainer}
              ref={ref => (this.scrollView = ref)}
              onScroll={e => {
                this.setState({
                  formScrollPosition: e.nativeEvent.contentOffset.y,
                });
              }}
              scrollEventThrottle={0}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}>
              <Survey activeMarker={activeMarker} onSelect={this.setFormResponse} />
              <Divider style={{ marginTop: 10 }} />
              <View style={styles.drawerFooter}>
                <Button
                  onPress={() =>
                    this.setState({
                      noteModalVisible: true,
                    })
                  }
                  style={styles.greyButton}
                  theme={{ ...Theme, roundness: 20 }}>
                  <Text>{noteButtonLabel}</Text>
                </Button>
                <Button
                  onPress={() => this.resetDrawer(MAX_DRAWER_TRANSLATE_Y)}
                  theme={{ ...Theme, roundness: 20 }}
                  style={styles.greyButton}>
                  <Text>Back to Map</Text>
                </Button>
              </View>
            </ScrollView>
          )}
          <View style={styles.bottomGuard} />
        </Animated.View>
        {this.state.markerMenuTopLocation && (
          <MarkerMenu
            topLocation={this.state.markerMenuTopLocation}
            onDuplicatePress={() => {
              this.duplicateMarker(activeMarkerId);
            }}
            onDeletePress={() => {
              this.deleteMarker(activeMarkerId);
            }}
            onClose={() => {
              this.setState({ markerMenuTopLocation: null });
            }}
          />
        )}
        {this.state.noteModalVisible && (
          <NoteModal
            initialValue={note}
            onClose={note => {
              this.setFormResponse(activeMarkerId, 'note', note, 0);
              this.setState({ noteModalVisible: false });
            }}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: 'white',
    height: Layout.drawer.height,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  drawerHeader: {
    alignSelf: 'stretch',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markerMenuButton: {
    padding: 20,
  },
  titleContainer: { paddingVertical: 10, paddingHorizontal: 20, flexGrow: 1 },
  title: { fontWeight: 'bold' },
  personIconWrapper: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    alignSelf: 'stretch',
  },
  drawerFooter: {
    padding: 10,
    flexDirection: 'row',
  },
  greyButton: {
    width: Layout.window.width,
    flexShrink: 1,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
  },
  bottomGuard: {
    // This view adds whitespace below the drawer, in case the user over-pans it
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -500,
    height: 500,
    backgroundColor: 'white',
  },
  indicator: {
    width: 30,
    height: 5,
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: '#D8D8D8',
    borderRadius: 10,
  },
  chevron: { marginRight: 20 },
  instructionsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    margin: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#E6E4E0',
  },
  instructionsIcon: {
    marginRight: 10,
  },
  instructions: {
    flexShrink: 1,
  },
});

export default withNavigation(SurveyScreen);
