import { Icon } from 'expo';
import React from 'react';
import {
  Alert,
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Divider, Paragraph } from 'react-native-paper';
import { withNavigation } from 'react-navigation';
import * as _ from 'lodash';
import moment from 'moment';
import * as uuid from 'uuid';
import MapWithMarkers from '../components/MapWithMarkers';
import PersonIcon from '../components/PersonIcon';
import Survey from '../components/Survey';
import Layout from '../constants/Layout';
import Theme from '../constants/Theme';
import NoteModal from '../components/NoteModal';
import MarkerMenu from '../components/MarkerMenu';
import { deleteDataPoint, getDataPointsforSurvey, saveDataPoint } from '../lib/commonsClient';
import QUESTION_CONFIG from '../config/questions';

import { getRandomIconColor } from '../utils/color';

// TODO (Ananta): shouold be dynamically set
const MIN_DRAWER_TRANSLATE_Y = 0;
const MID_DRAWER_TRANSLATE_Y = Layout.drawer.height - 300;

// mostly collapsed, with just the header peaking out
const MAX_DRAWER_TRANSLATE_Y = Layout.drawer.height - 100;
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
          <Icon.MaterialIcons name="people" size={30} color="white" />
        </TouchableOpacity>
      ),
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      activeMarkerId: null,
      markers: [],
      zoneLatLngs: props.navigation.state.params.zoneCoordinates,
      token: props.navigation.state.params.token,
      studyFields: props.navigation.state.params.studyFields,
      markerMenuTopLocation: undefined,
      noteModalVisible: false,
      formScrollPosition: 0,
      pan: new Animated.Value(INITIAL_DRAWER_TRANSLATE_Y),
    };
    this._drawerY = INITIAL_DRAWER_TRANSLATE_Y;
    this.state.pan.addListener(value => {
      this._drawerY = value.value;
    });

    this.resetDrawer = this.resetDrawer.bind(this);
    this.getToggleDirection = this.getToggleDirection.bind(this);
    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.selectMarker = this.selectMarker.bind(this);
    this.deleteMarker = this.deleteMarker.bind(this);
    this.createNewMarker = this.createNewMarker.bind(this);
    this.duplicateMarker = this.duplicateMarker.bind(this);
    this.setFormResponse = this.setFormResponse.bind(this);
    this.navigateToMarkerList = this.navigateToMarkerList.bind(this);
    this.syncMarkersWithListView = this.syncMarkersWithListView.bind(this);
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        // This method captures gestures, (which means the scrollview will not scroll).
        // For drags that should not block other gesture responses,
        // use onMoveShouldSetPanResponder instead
        const verticalDistance = Math.abs(gestureState.dy);
        const horizontalDistance = Math.abs(gestureState.dx);
        const isVerticalPan = verticalDistance > horizontalDistance;

        if (isVerticalPan) {
          const directionUp = gestureState.dy < 0;
          if (directionUp) {
            // Respond to upward drags so long as there is room to expand the drawer
            const hasSpaceToPanUp = this._drawerY > MIN_DRAWER_TRANSLATE_Y;
            return hasSpaceToPanUp;
          }
          // Respond to downward drags if they are a long distance / high velocity
          // or if the scrollview is at the top
          const hasSpaceToPanDown = this._drawerY <= MAX_DRAWER_TRANSLATE_Y;
          const isScrolledToTop = !this.state.formScrollPosition;
          const isHeavyScroll = Math.abs(gestureState.dy) > 80 || Math.abs(gestureState.vy) > 1.2;
          return hasSpaceToPanDown && (isScrolledToTop || isHeavyScroll);
        }
        return false;
      },
      // set store current value as offset, and set value to 0,
      // since onPanResponderMove converts delta offset into value
      // and starts from 0 on every new gesture
      onPanResponderGrant: () => {
        this.state.pan.setOffset(this.state.pan._value);
        this.state.pan.setValue(0);
      },
      // Follow the gesture
      onPanResponderMove: Animated.event([null, { dy: this.state.pan }]),

      // Snap to a breakpoint when the gesture is release
      onPanResponderRelease: (evt, gestureState) => {
        // look at velocity on release, instead of direction
        // If user wiggles back and forth, we want to snap in the direction of terminal velocity
        const directionUp = gestureState.vy < 0;
        this.state.pan.flattenOffset();
        const y = directionUp ? MIN_DRAWER_TRANSLATE_Y : MAX_DRAWER_TRANSLATE_Y;

        Animated.spring(this.state.pan, {
          toValue: y,
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

  componentDidMount() {
    const surveyId = this.props.navigation.getParam('surveyId');

    this.props.navigation.setParams({
      navigateToMarkerList: this.navigateToMarkerList,
    });

    getDataPointsforSurvey(this.state.token, surveyId).then(dataPoints => {
      const markers = dataPoints.map((d, i) => {
        const title = `Person ${i}`;
        const color = getRandomIconColor();
        console.log(d);
        return {
          ...d,
          color,
          title,
        };
      });
      this.setState({ markers });
    });
  }

  getToggleDirection() {
    const direction = this._drawerY === MIN_DRAWER_TRANSLATE_Y ? 'down' : 'up';
    return direction;
  }

  setFormResponse(dataPointId, key, value, heightToScroll) {
    const markersCopy = [...this.state.markers];
    const marker = _.find(markersCopy, { dataPointId });
    const surveyId = this.props.navigation.getParam('surveyId');
    const { token } = this.state;

    if (marker) {
      const oldMarkerValue = marker[key];
      marker[key] = value;
      this.setState({
        markers: markersCopy,
      });

      if (surveyId !== 'DEMO') {
        saveDataPoint(token, surveyId, marker).catch(() => {
          Alert.alert(
            'Error',
            'Something went wrong while updating marker. Please try again later.',
            [{ text: 'OK' }],
          );

          marker[key] = oldMarkerValue;
          this.setState({
            markers: markersCopy,
          });
        });
      }

      if (heightToScroll) {
        const currentScrollPosition = this.state.formScrollPosition;
        const currentDrawerOffset = this._drawerY;
        const newDrawerOffset = currentDrawerOffset - heightToScroll;

        if (newDrawerOffset >= MIN_DRAWER_TRANSLATE_Y) {
          Animated.timing(this.state.pan, {
            toValue: newDrawerOffset,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            // hack to trigger a re-render
            this.setState(this.state);
          });
        } else if (currentDrawerOffset > MIN_DRAWER_TRANSLATE_Y) {
          // Animate drawer to the top
          // then scroll the remaining amount to ensure next question is visible
          const remainder = currentDrawerOffset - MIN_DRAWER_TRANSLATE_Y;
          Animated.timing(this.state.pan, {
            toValue: MIN_DRAWER_TRANSLATE_Y,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            // hack to trigger a re-render
            this.setState(this.state);
          });
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

  resetDrawer(y = MID_DRAWER_TRANSLATE_Y) {
    if (this._drawerY !== y && this.state.markers.length) {
      Animated.timing(this.state.pan, {
        toValue: y,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // hack to trigger a re-render
        this.setState(this.state);
      });
    }
    if (this.state.formScrollPosition) {
      this.scrollView.scrollTo({ y: 0, animated: false });
    }
  }

  toggleDrawer() {
    const y =
      this.getToggleDirection() === 'down' ? MAX_DRAWER_TRANSLATE_Y : MIN_DRAWER_TRANSLATE_Y;
    this.resetDrawer(y);
  }

  deleteMarker(dataPointId) {
    const surveyId = this.props.navigation.getParam('surveyId');

    const markersCopy = [...this.state.markers];
    const newMarkers = _.reject(markersCopy, { dataPointId });
    const newActiveMarkerId = newMarkers.length
      ? newMarkers[newMarkers.length - 1].dataPointId
      : null;

    const oldMarkers = [...this.state.markers];
    this.setState({
      markers: newMarkers,
      activeMarkerId: newActiveMarkerId,
    });

    if (surveyId !== 'DEMO') {
      deleteDataPoint(this.state.token, surveyId, dataPointId).catch(() => {
        Alert.alert('Error', 'Something went wrong removing datapoint. Please try again later.', [
          { text: 'OK' },
        ]);
        this.setState({
          markers: oldMarkers,
          activeMarkerId: dataPointId,
        });
      });
    }
    this.resetDrawer(MAX_DRAWER_TRANSLATE_Y);
  }

  duplicateMarker(originalDataPointId) {
    const surveyId = this.props.navigation.getParam('surveyId');
    const markersCopy = [...this.state.markers];
    const markerToCopy = _.find(markersCopy, {
      dataPointId: originalDataPointId,
    });

    if (markerToCopy) {
      const date = moment();
      const title = `Person ${markersCopy.length + 1}`;
      const dataPointId = uuid.v4();
      const color = getRandomIconColor([markerToCopy.color]);
      const { activeMarkerId: oldActiveMarkerId } = this.state;

      const duplicateMarker = {
        ...markerToCopy,
        dataPointId,
        color,
        title,
        creationDate: date.toISOString(),
      };

      markersCopy.push(duplicateMarker);
      this.setState({ markers: markersCopy, activeMarkerId: dataPointId }, this.resetDrawer);

      if (surveyId !== 'DEMO') {
        saveDataPoint(this.state.token, surveyId, duplicateMarker).catch(error => {
          Alert.alert(
            'Error',
            'Something went wrong while duplicating marker. Please try again later.',
            [{ text: 'OK' }],
          );
          markersCopy.pop();
          this.setState({
            markers: markersCopy,
            activeMarkerId: oldActiveMarkerId,
          });
        });
      }
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
    const surveyId = this.props.navigation.getParam('surveyId');
    const { markers, activeMarkerId: oldActiveMarkerId } = this.state;
    // todo creation date vs latest update date? how do we handle the numbering later w/o creation?
    const date = moment();
    const title = `Person ${markers.length + 1}`;
    const dataPointId = uuid.v4();

    const marker = {
      dataPointId,
      location,
      color,
      title,
      creationDate: date.toISOString(),
    };

    this.setState({ markers: [...markers, marker], activeMarkerId: dataPointId }, this.resetDrawer);
    if (surveyId !== 'DEMO') {
      saveDataPoint(this.state.token, surveyId, marker).catch(error => {
        Alert.alert(
          'Error',
          'Something went wrong while creating a marker. Please try again later.',
          [{ text: 'OK' }],
        );
        this.setState({ markers, activeMarkerId: oldActiveMarkerId });
      });
    }
  }

  syncMarkersWithListView(markers) {
    const activeMarkerId = markers.length ? markers[markers.length - 1].dataPointId : undefined;
    this.setState({ markers, activeMarkerId });
  }

  navigateToMarkerList() {
    const { token, studyFields, surveyId } = this.props.navigation.state.params;
    const questions = _.filter(
      QUESTION_CONFIG,
      ({ questionKey }) => studyFields.indexOf(questionKey) !== -1,
    );
    this.props.navigation.navigate('MarkerListScreen', {
      markers: this.state.markers,
      token,
      surveyId,
      questions,
      sync: this.syncMarkersWithListView,
      emptyTitle: 'Take a snapshot',
      emptyDescription:
        'Drop a pin for every person you see in your zone, then select their attributes. Rest easy when your snapshot is done.',
    });
  }

  render() {
    const { studyFields } = this.props.navigation.state.params;
    const { activeMarkerId, markers } = this.state;
    const activeMarker = _.find(markers, { dataPointId: activeMarkerId });
    const note = _.get(activeMarker, 'note', '');
    const noteButtonLabel = note ? 'Edit note' : 'Add note';
    const dateLabel = activeMarker && moment(activeMarker.creationDate).format('HH:mm');

    // Adjust map viewport when the drawer slides up, to keep new marker in view
    const mapObscuredHeight = Layout.drawer.height - this._drawerY;
    // But don't do it *every time* the drawer moves
    const mapMaxPadding = Layout.drawer.height - MID_DRAWER_TRANSLATE_Y;
    const mapBottomPadding = Math.min(mapObscuredHeight, mapMaxPadding);

    return (
      <View style={styles.container}>
        <MapWithMarkers
          mapPadding={{
            top: 20,
            right: 20,
            bottom: mapBottomPadding,
            left: 20,
          }}
          onMapPress={this.resetDrawer}
          onMapLongPress={this.createNewMarker}
          activeMarkerId={this.state.activeMarkerId}
          markers={this.state.markers}
          zoneLatLngs={this.state.zoneLatLngs}
          onMarkerPress={this.selectMarker}
        />
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [
                {
                  translateY: this.state.pan,
                },
              ],
            },
          ]}
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
                  <Text>{dateLabel}</Text>
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
              <Survey
                fields={studyFields}
                activeMarker={activeMarker}
                onSelect={this.setFormResponse}
              />
              <Divider />
              <View style={styles.drawerFooter}>
                <TouchableOpacity
                  onPress={() =>
                    this.setState({
                      noteModalVisible: true,
                    })
                  }
                  style={styles.greyButton}>
                  <Text>{noteButtonLabel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.resetDrawer(MAX_DRAWER_TRANSLATE_Y)}
                  style={styles.greyButton}>
                  <Text>Back to Map</Text>
                </TouchableOpacity>
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
            onClose={updatedNote => {
              this.setFormResponse(activeMarkerId, 'note', updatedNote, 0);
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
    marginBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markerMenuButton: {
    padding: 20,
  },
  titleContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  title: {
    fontFamily: 'product-medium',
  },
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
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    paddingHorizontal: 20,
    paddingVertical: 5,
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
