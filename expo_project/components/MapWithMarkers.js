import PropTypes from "prop-types";
import React from "react";
import { StyleSheet } from "react-native";
import { MapView } from "expo";
import PersonIcon from "./PersonIcon";
import { Location, Permissions } from "expo";

import MapConfig from "../constants/Map";

class MapWithMarkers extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      initialRegion: null
    };
  }

  componentDidMount() {
    this._getLocationAsync();
  }

  _getLocationAsync = async () => {
    let region = MapConfig.defaultRegion;
    // react native maps (the belly of expo's MapView ) requests location permissions for us
    // so here we are only retrieving permission, not asking for it
    const { status } = await Permissions.getAsync(Permissions.LOCATION);
    if (status === "granted") {
      const location = await Location.getCurrentPositionAsync({
        enableHighAccuracy: true
      });
      const { latitude, longitude } = location.coords;
      region = {
        latitude,
        longitude,
        latitudeDelta: 0.0043,
        longitudeDelta: 0.0034
      };
    }
    this.setState({ region });
  };

  render() {
    const {
      markers,
      activeMarkerId,
      onMarkerDragEnd,
      onMarkerPress,
      onMapPress,
      onMapLongPress
    } = this.props;
    return this.state.region ? (
      <MapView
        style={styles.mapStyle}
        onPress={onMapPress}
        onLongPress={onMapLongPress}
        initialRegion={this.state.region}
        showsUserLocation
        scrollEnabled
        zoomEnabled
        rotateEnabled
        showsCompass
        pitchEnabled={false}
      >
        {markers.map(marker => {
          const selected = marker.id === activeMarkerId;
          // Update the key when selected or delected, so the marker re renders and centers itself based on the new child size
          const key = marker.id + (selected ? "-selected" : "");
          return (
            <MapView.Marker
              coordinate={marker.coordinate}
              key={key}
              identifier={marker.id}
              stopPropagation
              draggable
              onDragEnd={onMarkerDragEnd}
              onPress={() => onMarkerPress(marker.id)}
              anchor={{ x: 0, y: 0 }}
              calloutAnchor={{ x: 0, y: 0 }}
            >
              <PersonIcon
                backgroundColor={marker.color}
                size={selected ? 24 : 16}
                shadow
              />
            </MapView.Marker>
          );
        })}
      </MapView>
    ) : null;
  }
}

const styles = StyleSheet.create({
  mapStyle: { flex: 1 }
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
