import React from "react";
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity
} from "react-native";
import { Button } from "react-native-paper";
import { withNavigation } from "react-navigation";
import * as _ from "lodash";
import moment from "moment";
import MapWithMarkers from "../components/MapWithMarkers";
import MarkerCarousel from "../components/MarkerCarousel";
import Survey from "../components/Survey";
import { iconColors } from "../constants/Colors";
import Layout from "../constants/Layout";
import firebase from "../lib/firebaseSingleton";

// TODO (Ananta): shouold be dynamically set
const INITIAL_DRAWER_TRANSLATE_Y = Layout.drawer.height;
const MIN_DRAWER_TRANSLATE_Y = 0;
const MID_DRAWER_TRANSLATE_Y = Layout.drawer.height - 300;
const MAX_DRAWER_TRANSLATE_Y = Layout.drawer.height - 95; // mostly collapsed, with just the header peaking out

function _markerToDataPoint(marker) {
  const dataPoint = {};
  fields = [
    "gender",
    "groupSize",
    "mode",
    "object",
    "posture",
    "timestamp",
    "location"
  ];
  fields.forEach(field => {
    if (marker[field]) {
      dataPoint[field] = marker[field];
    }
  });

  return dataPoint;
}

class Indicator extends React.Component {
  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress}>
        <View style={styles.indicator} />
      </TouchableOpacity>
    );
  }
}

class SurveyScreen extends React.Component {
  static navigationOptions = {
    title: "Long press map to add a pin"
  };

  constructor(props) {
    super(props);

    // firestore has its own timestamp type
    this.firestore = firebase.firestore();
    this.firestore.settings({ timestampsInSnapshots: true });

    this.state = {
      activeMarkerId: null,
      markers: [],
      formScrollPosition: 0,
      pan: new Animated.ValueXY({ x: 0, y: INITIAL_DRAWER_TRANSLATE_Y })
    };
    this._drawerY = INITIAL_DRAWER_TRANSLATE_Y;
    this.state.pan.addListener(value => (this._drawerY = value.y));

    this.resetDrawer = this.resetDrawer.bind(this);
    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.selectMarker = this.selectMarker.bind(this);
    this.createNewMarker = this.createNewMarker.bind(this);
    this.setMarkerLocation = this.setMarkerLocation.bind(this);
    this.setFormResponse = this.setFormResponse.bind(this);
  }

  componentDidMount() {
    // Query for saved data
    const studyId = this.props.navigation.getParam("studyId");
    const surveyId = this.props.navigation.getParam("surveyId");

    this.firestore
      .collection("study")
      .doc(studyId)
      .collection("survey")
      .doc(surveyId)
      .collection("dataPoints")
      .get()
      .then(querySnapshot => {
        const markers = [];

        querySnapshot.forEach(function(doc) {
          const marker = {
            id: doc.id,
            ...doc.data(),
            color: _.sample(_.values(iconColors))
          };
          markers.push(marker);
        });
        this.setState({ markers });
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
            const isHeavyScroll =
              Math.abs(gestureState.dy) > 80 || Math.abs(gestureState.vy) > 1.2;
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
            y
          },
          useNativeDriver: true,
          friction: 5
        }).start();

        if (this.state.formScrollPosition) {
          this.scrollView.scrollTo({
            y: 0,
            animated: false
          });
        }
      }
    });
  }

  toggleDrawer() {
    const y =
      this._drawerY === MIN_DRAWER_TRANSLATE_Y
        ? MAX_DRAWER_TRANSLATE_Y
        : MIN_DRAWER_TRANSLATE_Y;
    Animated.timing(this.state.pan, {
      toValue: { x: 0, y },
      duration: 200,
      useNativeDriver: true
    }).start();

    if (this.state.formScrollPosition) {
      this.scrollView.scrollTo({ y: 0, animated: false });
    }
  }

  resetDrawer(y = MID_DRAWER_TRANSLATE_Y) {
    if (this._drawerY !== y && this.state.markers.length) {
      Animated.timing(this.state.pan, {
        toValue: { x: 0, y },
        duration: 200,
        useNativeDriver: true
      }).start();
    }
    if (this.state.formScrollPosition) {
      this.scrollView.scrollTo({ y: 0, animated: false });
    }
  }

  setFormResponse(id, key, value, selectableHeight) {
    const markersCopy = [...this.state.markers];
    const marker = _.find(markersCopy, {
      id
    });
    const studyId = this.props.navigation.getParam("studyId");
    const surveyId = this.props.navigation.getParam("surveyId");

    if (marker) {
      marker[key] = value;
      this.setState({
        markers: markersCopy
      });
      this.firestore
        .collection("study")
        .doc(studyId)
        .collection("survey")
        .doc(surveyId)
        .collection("dataPoints")
        .doc(marker.id)
        .set(_markerToDataPoint(marker));

      const currentScrollPosition = this.state.formScrollPosition;
      const currentDrawerOffset = this._drawerY;
      const newDrawerOffset = currentDrawerOffset - selectableHeight;

      if (newDrawerOffset >= MIN_DRAWER_TRANSLATE_Y) {
        Animated.timing(this.state.pan, {
          toValue: { x: 0, y: newDrawerOffset },
          duration: 200,
          useNativeDriver: true
        }).start();
      } else if (currentDrawerOffset > MIN_DRAWER_TRANSLATE_Y) {
        // Animate drawer to the top
        // then scroll the remaining amount to ensure next question is visible
        const remainder = currentDrawerOffset - MIN_DRAWER_TRANSLATE_Y;
        Animated.timing(this.state.pan, {
          toValue: { x: 0, y: MIN_DRAWER_TRANSLATE_Y },
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
    if (activeMarkerId === this.state.activeMarkerId) {
      this.toggleDrawer();
    } else {
      this.setState({ activeMarkerId });
      this.resetDrawer(MIN_DRAWER_TRANSLATE_Y);
    }
  }

  createNewMarker(location, color) {
    const studyId = this.props.navigation.getParam("studyId");
    const surveyId = this.props.navigation.getParam("surveyId");
    const markersCopy = [...this.state.markers];
    const date = moment();
    const dateLabel = date.format("HH:mm");
    const title = "Person " + (markersCopy.length + 1);

    const marker = {
      location,
      color,
      title,
      dateLabel
    };

    // TODO (Seabass or Ananta): Figure out a way to get faster UI feedback
    // Would be nice for UI to optimistically render before firestore returns
    this.firestore
      .collection("study")
      .doc(studyId)
      .collection("survey")
      .doc(surveyId)
      .collection("dataPoints")
      .add(_markerToDataPoint(marker))
      .then(doc => {
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

  setMarkerLocation(id, location) {
    // TODO: add logic for updating in db
    const studyId = this.props.navigation.getParam("studyId");
    const surveyId = this.props.navigation.getParam("surveyId");
    const markersCopy = [...this.state.markers];
    const marker = _.find(markersCopy, { id });

    if (marker) {
      marker.location = location;
      this.setState({
        markers: markersCopy
      });

      this.firestore
        .collection("study")
        .doc(studyId)
        .collection("survey")
        .doc(surveyId)
        .collection("dataPoints")
        .doc(marker.firestoreId)
        .update({ location: marker.location });
    }
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
            { transform: this.state.pan.getTranslateTransform() }
          ]}
          {...this._panResponder.panHandlers}
        >
          <View style={[styles.drawerHeader]}>
            <Indicator onPress={this.toggleDrawer} />
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
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              <Survey
                activeMarker={activeMarker}
                onSelect={this.setFormResponse}
              />
              <Button
                primary
                raised
                dark
                onPress={() => this.resetDrawer()}
                style={{ margin: 20 }}
              >
                Done
              </Button>
            </ScrollView>
          )}
          <View style={styles.bottomGuard} />
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
    height: Layout.drawer.height,
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
    alignSelf: "stretch"
  },
  formContainer: {
    alignSelf: "stretch"
  },
  indicator: {
    width: 30,
    height: 5,
    alignSelf: "center",
    marginTop: 10,
    backgroundColor: "#D8D8D8",
    borderRadius: 10
  },
  bottomGuard: {
    // This view adds whitespace below the drawer, in case the user over-pans it
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -500,
    height: 500,
    backgroundColor: "white"
  }
});

export default withNavigation(SurveyScreen);
