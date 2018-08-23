import React from "react";
import {
  Dimensions,
  PanResponder,
  Platform,
  StyleSheet,
  View,
  Animated
} from "react-native";
import { withNavigation } from "react-navigation";
import { firestore } from 'firebase';
import * as _ from "lodash";
import Colors, { iconColors } from "../constants/Colors";
import { ScrollView } from "../node_modules/react-native-gesture-handler";
const { height } = Dimensions.get("window");
import moment from "moment";
import { Header } from "react-navigation";

import MapWithMarkers from "../components/MapWithMarkers";
import MarkerCarousel from "../components/MarkerCarousel";
import Survey from "../components/Survey";
import ColoredButton from "../components/ColoredButton";

const HEADER_HEIGHT = Header.HEIGHT;
const MIN_DRAWER_OFFSET = 0; // fix this

const DRAWER_HEIGHT = height - HEADER_HEIGHT;
const INITIAL_DRAWER_OFFSET = DRAWER_HEIGHT;

const studyId = '50Kb9Jfa1ejkURIIE3T2'; // todo should be dynamically set
const surveyId = 'UaAyBbLNOobGO2prwpsT'; // todo should be dynamically set


function _markerToDataPoint(marker) {
  const dataPoint = {}
  fields = [ 'gender', 'groupSize', 'mode', 'object', 'posture', 'timestamp' ];
  fields.forEach((field) => {
    if (marker[field]) {
      dataPoint[field] = marker[field]
    }
  });

  if (marker.coordinate) {
    dataPoint.location = marker.coordinate;
  }
  return dataPoint;
}

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: "Long press map to add a pin"
  };

  constructor(props) {
    super(props);

    this.drawerOffsetY = new Animated.Value(INITIAL_DRAWER_OFFSET);
    this.drawerOffsetY.addListener(({ value }) => (this._value = value));
    // firestore has its own timestamp type
    this.firestore = this.props.screenProps.firebase.firestore();
    this.firestore.settings({ timestampsInSnapshots: true });

    this.state = {
      activeMarkerId: null,
      markers: [],
      formScrollPosition: 0,
      drawerHeaderHeight: 0
    };
    this.resetDrawer = this.resetDrawer.bind(this);
    this.selectMarker = this.selectMarker.bind(this);
    this.getRandomIconColor = this.getRandomIconColor.bind(this);
    this.createNewMarker = this.createNewMarker.bind(this);
    this.setMarkerLocation = this.setMarkerLocation.bind(this);
    this.setFormResponse = this.setFormResponse.bind(this);

    // TODO (Ananta): Make this easier to understand
    // TODO (Ananta): use a "top" value instead of an offset from top, so + / - is a consistent direction between pan responder and scrollview
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => false,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Respond to downward drags if they are a long distance or the scrollview is at the top
        // Upward drags are handled in onMoveShouldSetPanResponderCapture because they override all child gestures

        const verticalDistance = Math.abs(gestureState.dy);
        const horizontalDistance = Math.abs(gestureState.dx);
        const isVerticalPan = verticalDistance > horizontalDistance;

        if (isVerticalPan) {
          // only pan if it's a long distance or you can't scroll any more
          const directionDown = gestureState.dy > 0;
          const scrolledToTop = !this.state.formScrollPosition;
          const isLongDistance = gestureState.dy > 50;
          return directionDown && (scrolledToTop || isLongDistance);
        }
        return false;
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        // Respond and capture (disallow children from responding) if panning upward
        // Returning true here will skip onMoveShouldSetPanResponder

        const verticalDistance = Math.abs(gestureState.dy);
        const horizontalDistance = Math.abs(gestureState.dx);
        const isVerticalPan = verticalDistance > horizontalDistance;

        if (isVerticalPan) {
          const directionUp = gestureState.dy < 0;
          const hasSpaceToPanUp = this.drawerOffsetY._value > MIN_DRAWER_OFFSET;
          return directionUp && hasSpaceToPanUp;
        }
        return false;
      },
      onPanResponderMove: (evt, gestureState) => {
        const directionDown = gestureState.dy > 0;
        const currentDrawerOffset = this.drawerOffsetY._value;

        // TODO: Make the drawer follow user's gesture
        const canMoveDown =
          directionDown &&
          currentDrawerOffset <
            INITIAL_DRAWER_OFFSET - this.state.drawerHeaderHeight;
        const canMoveUp =
          !directionDown && currentDrawerOffset > MIN_DRAWER_OFFSET;

        if (canMoveUp || canMoveDown) {
          const toValue = canMoveUp
            ? MIN_DRAWER_OFFSET
            : INITIAL_DRAWER_OFFSET - this.state.drawerHeaderHeight;
          Animated.spring(this.drawerOffsetY, {
            toValue,
            useNativeDriver: true
          }).start();
          if (canMoveDown && this.state.formScrollPosition) {
            this.scrollView.scrollTo({
              x: 0,
              y: 0,
              animated: false
            });
          }
        }
        return true;
      }
    });
  }

  resetDrawer() {
    const isEmpty = this.state.markers.length === 0;
    const offsetVal = isEmpty ? INITIAL_DRAWER_OFFSET : DRAWER_HEIGHT - 250; //fix this
    if (this.drawerOffsetY._value !== offsetVal) {
      Animated.timing(this.drawerOffsetY, {
        toValue: offsetVal,
        duration: 200,
        useNativeDriver: true
      }).start();
    }

    if (this.state.formScrollPosition) {
      this.scrollView.scrollTo({ x: 0, y: 0, animated: false });
    }
  }

  setFormResponse(id, key, value, selectableHeight) {
    const markersCopy = [...this.state.markers];
    const marker = _.find(markersCopy, {
      id
    });

    if (marker) {
      marker[key] = value;
      this.setState({
        markers: markersCopy
      });
      this.firestore
        .collection('study').doc(studyId)
        .collection('survey').doc(surveyId)
        .collection('dataPoints').doc(marker.id)
        .set(_markerToDataPoint(marker));

      const currentScrollPosition = this.state.formScrollPosition;
      const currentDrawerOffset = this.drawerOffsetY._value;
      const newDrawerOffset = currentDrawerOffset - selectableHeight;

      if (newDrawerOffset >= MIN_DRAWER_OFFSET) {
        Animated.timing(this.drawerOffsetY, {
          toValue: newDrawerOffset,
          duration: 200,
          useNativeDriver: true
        }).start();
      } else if (currentDrawerOffset > MIN_DRAWER_OFFSET) {
        // Animate drawer to the top
        // then scroll the remaining amount to ensure next question is visible
        const remainder = currentDrawerOffset - MIN_DRAWER_OFFSET;
        Animated.timing(this.drawerOffsetY, {
          toValue: MIN_DRAWER_OFFSET,
          duration: 200,
          useNativeDriver: true
        }).start();
        this.scrollView.scrollTo({
          y: currentScrollPosition + selectableHeight - remainder
        });
      } else {
        this.scrollView.scrollTo({
          y: currentScrollPosition + selectableHeight
        });
      }
    }
  }

  selectMarker(activeMarkerId) {
    this.setState({ activeMarkerId });
    this.resetDrawer();
  }

  createNewMarker(e) {
    const markersCopy = [...this.state.markers];
    const date = moment();
    const dateLabel = date.format("HH:mm");
    const timestamp = date.format("x");
    const title = "Person " + (markersCopy.length + 1);

    const marker = {
      coordinate: e.nativeEvent.coordinate,
      color: this.getRandomIconColor(),
      title,
      dateLabel
    };

    this.firestore
      .collection('study').doc(studyId)
      .collection('survey').doc(surveyId)
      .collection('dataPoints')
      .add(_markerToDataPoint(marker))
      .then((doc) => {
        const { id, timestamp } = doc;
        marker.id = id;
        marker.timestamp = timestamp;
        markersCopy.push(marker);
        this.setState(
          { markers: markersCopy, activeMarkerId: id },
          this.resetDrawer
        );
      });

      }

  setMarkerLocation(e) {
    // TODO: add logic for updating in db
    const { id, coordinate } = e.nativeEvent;
    const markersCopy = [...this.state.markers];
    const marker = _.find(markersCopy, { id });

    if (marker) {
      marker.coordinate = coordinate;
      this.setState({
        markers: markersCopy
      });

      this.firestore
        .collection('study').doc(studyId)
        .collection('survey').doc(surveyId)
        .collection('dataPoints').doc(marker.firestoreId)
        .update({location: marker.coordinate});
    }
  }

  getRandomIconColor() {
    const iconOptions = Object.values(iconColors);
    return iconOptions[Math.floor(Math.random() * iconOptions.length)];
  }

  render() {
    const { activeMarkerId, markers } = this.state;
    const activeMarker = _.find(markers, { id: activeMarkerId });
    return (
      <View style={styles.container}>
        <MapWithMarkers
          onMapPress={this.resetDrawer}
          onMapLongPress={this.createNewMarker}
          activeMarkerId={this.state.activeMarkerId}
          markers={this.state.markers}
          onMarkerPress={this.selectMarker}
          onMarkerDragEnd={this.setMarkerLocation}
        />
        <Animated.View
          style={[
            styles.drawer,
            { transform: [{ translateY: this.drawerOffsetY }] }
          ]}
          {...this._panResponder.panHandlers}
        >
          <View
            style={[styles.drawerHeader]}
            onLayout={e =>
              this.setState({
                drawerHeaderHeight: e.nativeEvent.layout.height
              })
            }
          >
            <MarkerCarousel
              markers={this.state.markers}
              activeMarkerId={this.state.activeMarkerId}
              onMarkerPress={this.selectMarker}
            />
          </View>
          {activeMarker && (
            <ScrollView
              style={styles.formContainer}
              ref={ref => (this.scrollView = ref)}
              onScroll={e => {
                this.setState({
                  formScrollPosition: e.nativeEvent.contentOffset.y
                });
              }}
              scrollEventThrottle={0}
            >
              <Survey
                activeMarker={activeMarker}
                onSelect={this.setFormResponse}
              />
              <ColoredButton
                backgroundColor={Colors.colorPrimary}
                color="white"
                onPress={this.resetDrawer}
                label="Done"
              />
            </ScrollView>
          )}
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  drawer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "white",
    height: DRAWER_HEIGHT,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { height: -3 },
        shadowOpacity: 0.2,
        shadowRadius: 3
      },
      android: {
        elevation: 20
      }
    })
  },
  drawerHeader: {
    alignSelf: "stretch",
    marginTop: 10
  },
  formContainer: {
    paddingHorizontal: 20,
    alignSelf: "stretch"
  }
});

export default withNavigation(HomeScreen);
