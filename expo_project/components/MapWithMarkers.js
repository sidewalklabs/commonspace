import PropTypes from "prop-types";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { MapView } from "expo";
import PersonIcon from "./PersonIcon";
// import { Location, Permissions } from "expo";

import MapConfig from "../constants/Map";

class MapWithMarkers extends React.Component {
  constructor(props) {
    super(props);

    this.state = { region: MapConfig.defaultRegion };
  }

  // componentDidMount() {
  //   this._getLocationAsync();
  // }

  // _getLocationAsync = async () => {
  //   let region = MapConfig.defaultRegion;
  //   // react native maps (the belly of expo's MapView ) requests location permissions for us
  //   // so here we are only retrieving permission, not asking for it
  //   const { status } = await Permissions.askAsync(Permissions.LOCATION);
  //   if (status === "granted") {
  //     const location = await Location.getCurrentPositionAsync({
  //       enableHighAccuracy: true
  //     });
  //     const { latitude, longitude } = location.coords;
  //     region = {
  //       latitude,
  //       longitude,
  //       latitudeDelta: 0.0043,
  //       longitudeDelta: 0.0034
  //     };
  //   }
  //   this.setState({ region });
  // };

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
        pitchEnabled={false}
      >
        {markers.map(marker => {
          const selected = marker.id === activeMarkerId;
          const key = marker.id;
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
  mapStyle: {
    ...Platform.select({
      ios: {
        flex: 1
      },
      android: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    })
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
