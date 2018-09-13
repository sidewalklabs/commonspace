import { MapView } from 'expo';
import PropTypes from 'prop-types';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { iconColors } from '../constants/Colors';
import MapConfig from '../constants/Map';
import PersonIcon from '../components/PersonIcon';

// NOTE: A longPress is more like 500ms,
// however there's a delay between when the longPress is registered
// and when a new marker is created in firestore and thereafter rendered
// Currently setting halo animation to 1000 to account for that
// but that might confuse users who release early (e.g. at 600ms) which still ends up creating a marker
const CIRCULAR_PROGRESS_ANIMATION_DURATION = 1000;
const CIRCULAR_PROGRESS_SIZE = 100;

class MapWithMarkers extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      region: MapConfig.defaultRegion,
      circularProgressLocation: null,
      nextMarkerColor: this.getRandomIconColor()
    };
  }

  getRandomIconColor = () => {
    const iconOptions = Object.values(iconColors);
    return iconOptions[Math.floor(Math.random() * iconOptions.length)];
  };

  setNextColor = () => {
    this.setState({ nextMarkerColor: this.getRandomIconColor() });
  };

  startProgressAnimation = (locationX, locationY) => {
    this.setState({
      circularProgressLocation: {
        top: locationY - CIRCULAR_PROGRESS_SIZE / 2,
        left: locationX - CIRCULAR_PROGRESS_SIZE / 2
      }
    });
  };

  stopProgressAnimation = () => {
    this.setState({
      circularProgressLocation: null,
      nextMarkerColor: this.getRandomIconColor()
    });
  };

  render() {
    /* 
      Note: we're taking advantage of the fact that AnimatedCircularProgress animates on mount
      by mounting on pressIn and unmounting on pressOut. 
      Unmounting so often might give us a noticeable performance hit, so if that happens, we can instead manage fill in state.
    */
    const {
      markers,
      activeMarkerId,
      onMarkerDragEnd,
      onMarkerPress,
      onMapPress,
      onMapLongPress
    } = this.props;
    return this.state.region ? (
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={e => {
          this.startProgressAnimation(e.nativeEvent.locationX, e.nativeEvent.locationY);
        }}
        onPressOut={e => {
          this.stopProgressAnimation();
        }}
        style={styles.container}
      >
        <MapView
          style={styles.mapStyle}
          provider="google"
          onPress={() => onMapPress()}
          onLongPress={e => onMapLongPress(e.nativeEvent.coordinate, this.state.nextMarkerColor)}
          initialRegion={this.state.region}
          showsUserLocation
          zoomEnabled
          pitchEnabled={false}
          mapType="satellite"
        >
          <MapView.Polyline
            coordinates={MapConfig.polylineCoordinates}
            strokeColor="#D77C61"
            strokeWidth={6}
          />
          {markers.map(marker => {
            const selected = marker.id === activeMarkerId;
            const key = marker.id + (selected ? '-selected' : ''); //trigger a re render when switching states, so it recenters itself
            return (
              <MapView.Marker
                coordinate={marker.location}
                key={key}
                identifier={marker.id}
                stopPropagation
                draggable
                onDragEnd={e => onMarkerDragEnd(e.nativeEvent.id, e.nativeEvent.coordinate)}
                onPress={() => onMarkerPress(marker.id)}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <PersonIcon backgroundColor={marker.color} size={selected ? 24 : 16} />
              </MapView.Marker>
            );
          })}
        </MapView>
        {this.state.circularProgressLocation && (
          <AnimatedCircularProgress
            ref={ref => (this.circularProgress = ref)}
            style={[
              styles.circularProgress,
              {
                top: this.state.circularProgressLocation.top,
                left: this.state.circularProgressLocation.left
              }
            ]}
            size={CIRCULAR_PROGRESS_SIZE}
            width={5}
            tintColor={this.state.nextMarkerColor}
            backgroundColor="transparent"
            duration={CIRCULAR_PROGRESS_ANIMATION_DURATION}
            fill={100}
          />
        )}
      </TouchableOpacity>
    ) : null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative'
  },
  mapStyle: {
    ...Platform.select({
      ios: {
        flex: 1
      },
      android: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    })
  },
  circularProgress: {
    alignSelf: 'center',
    position: 'absolute',
    backgroundColor: 'transparent'
  }
});

MapWithMarkers.propTypes = {
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      coordinate: PropTypes.any,
      color: PropTypes.string,
      title: PropTypes.string,
      dateLabel: PropTypes.string,
      id: PropTypes.string
    })
  ).isRequired,
  activeMarkerId: PropTypes.string,
  onMarkerDragEnd: PropTypes.func.isRequired,
  onMarkerPress: PropTypes.func.isRequired,
  onMapPress: PropTypes.func.isRequired,
  onMapLongPress: PropTypes.func.isRequired
};

export default MapWithMarkers;
