import { MapView } from 'expo';
import PropTypes from 'prop-types';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import PersonIcon from '../components/PersonIcon';
import * as _ from 'lodash';

import { getRandomIconColor } from '../utils/color';

const CIRCULAR_PROGRESS_ANIMATION_DURATION = 500;
const CIRCULAR_PROGRESS_SIZE = 100;

class MapWithMarkers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
        animated: true,
      });
    }, 2000);
  };

  componentDidUpdate(prevProps) {
    const newMarkers = _.difference(this.props.markers, prevProps.markers);
    if (newMarkers.length && this.map) {
      const { location } = newMarkers[0];
      setTimeout(() => {
        this.map.animateToCoordinate(location, 400);
      }, 200);
    }
  }

  render() {
    /* 
      Note: we're taking advantage of the fact that AnimatedCircularProgress animates on mount
      by mounting on pressIn and unmounting on pressOut. 
      Unmounting so often might give us a noticeable performance hit, so if that happens, we can instead manage fill in state.
    */
    const {
      markers,
      activeMarkerId,
      onMarkerPress,
      onMapPress,
      onMapLongPress,
      zoneLatLngs,
      mapPadding,
    } = this.props;

    // TODO: add back points of interest markers once the backend supports them
    return (
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
          mapPadding={mapPadding}
          onLayout={this.fitToCoordinates}
          style={styles.mapStyle}
          provider="google"
          onPress={() => onMapPress()}
          onLongPress={e => onMapLongPress(e.nativeEvent.coordinate, this.state.markerColor)}
          showsUserLocation
          loadingEnabled
          moveOnMarkerPress={false}
          zoomEnabled
          pitchEnabled={false}
          mapType="satellite">
          <MapView.Polyline coordinates={zoneLatLngs} strokeColor="#D77C61" strokeWidth={6} />
          {markers.map((marker, index) => {
            const selected = marker.dataPointId === activeMarkerId;
            // trigger a re render when switching states, so it recenters itself
            const key = marker.dataPointId + (selected ? '-selected' : '');
            // overlapping markers flicker, unless you specify dominance
            // TODO: implement clustering and delete this hack
            const zIndex = index;
            return (
              <MapView.Marker
                zIndex={zIndex}
                coordinate={marker.location}
                key={key}
                identifier={marker.dataPointId}
                stopPropagation
                onPress={() => onMarkerPress(marker.dataPointId)}
                anchor={{ x: 0.5, y: 0.5 }}>
                <PersonIcon backgroundColor={marker.color} size={selected ? 24 : 16} />
              </MapView.Marker>
            );
          })}
          {/* {MapConfig.features.map((feature, index) => {
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
          })} */}
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
    );
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
      dataPointId: PropTypes.string,
    }),
  ).isRequired,
  zoneLatLngs: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    }),
  ),
  activeMarkerId: PropTypes.string,
  onMarkerPress: PropTypes.func.isRequired,
  onMapPress: PropTypes.func.isRequired,
  onMapLongPress: PropTypes.func.isRequired,
};

export default MapWithMarkers;
