import { MapView } from 'expo';
import PropTypes from 'prop-types';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import MapConfig from '../constants/Map';
import PersonIcon from '../components/PersonIcon';
import * as _ from 'lodash';

import { getRandomIconColor } from '../utils/color';

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
      markerColor: null,
    };
  }

  startProgressAnimation = (locationX, locationY) => {
    this.setState({
      markerColor: getRandomIconColor([this.state.markerColor]),
      circularProgressLocation: {
        top: locationY - CIRCULAR_PROGRESS_SIZE / 2,
        left: locationX - CIRCULAR_PROGRESS_SIZE / 2,
      },
    });
  };

  stopProgressAnimation = () => {
    this.setState({
      circularProgressLocation: null,
    });
  };

  fitToCoordinates = () => {
    // timeout hack to make sure map is loaded :/
    setTimeout(() => {
      this.map.fitToCoordinates(this.props.zoneLatLngs, {
        edgePadding: { top: 20, right: 20, bottom: 100, left: 20 },
        animated: true,
      });
    }, 2000);
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
      onMapLongPress,
      zoneLatLngs,
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
        style={styles.container}>
        <MapView
          ref={ref => {
            this.map = ref;
          }}
          onLayout={this.fitToCoordinates}
          style={styles.mapStyle}
          provider="google"
          onPress={() => onMapPress()}
          onLongPress={e => onMapLongPress(e.nativeEvent.coordinate, this.state.markerColor)}
          initialRegion={this.state.region}
          showsUserLocation
          zoomEnabled
          pitchEnabled={false}
          mapType="satellite">
          <MapView.Polyline coordinates={zoneLatLngs} strokeColor="#D77C61" strokeWidth={6} />
          {markers.map((marker, index) => {
            const selected = marker.id === activeMarkerId;
            // trigger a re render when switching states, so it recenters itself
            const key = marker.id + (selected ? '-selected' : '');
            // overlapping markers flicker, unless you specify dominance
            // TODO: implement clustering and delete this hack
            const zIndex = index;
            return (
              <MapView.Marker
                zIndex={zIndex}
                coordinate={marker.location}
                key={key}
                identifier={marker.id}
                stopPropagation
                draggable
                onDragEnd={e => onMarkerDragEnd(e.nativeEvent.id, e.nativeEvent.coordinate)}
                onPress={() => onMarkerPress(marker.id)}
                anchor={{ x: 0.5, y: 0.5 }}>
                <PersonIcon backgroundColor={marker.color} size={selected ? 24 : 16} />
              </MapView.Marker>
            );
          })}
          {MapConfig.features.map((feature, index) => {
            const { latitude, longitude, title, description } = feature;
            const coordinate = { latitude, longitude };
            return (
              <MapView.Marker
                coordinate={coordinate}
                key={title + index}
                title={title}
                description={description}
                stopPropagation
              />
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
                left: this.state.circularProgressLocation.left,
              },
            ]}
            size={CIRCULAR_PROGRESS_SIZE}
            width={8}
            tintColor={this.state.markerColor}
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
    position: 'relative',
  },
  mapStyle: {
    ...Platform.select({
      ios: {
        flex: 1,
      },
      android: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
    }),
  },
  circularProgress: {
    alignSelf: 'center',
    position: 'absolute',
    backgroundColor: 'transparent',
  },
});

MapWithMarkers.propTypes = {
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      location: PropTypes.any,
      color: PropTypes.string,
      title: PropTypes.string,
      dateLabel: PropTypes.string,
      id: PropTypes.string,
    }),
  ).isRequired,
  zoneLatLngs: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    }),
  ),
  activeMarkerId: PropTypes.string,
  onMarkerDragEnd: PropTypes.func.isRequired,
  onMarkerPress: PropTypes.func.isRequired,
  onMapPress: PropTypes.func.isRequired,
  onMapLongPress: PropTypes.func.isRequired,
};

export default MapWithMarkers;
