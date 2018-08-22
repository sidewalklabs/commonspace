import PropTypes from "prop-types";
import React from "react";
import { StyleSheet } from "react-native";
import { MapView } from "expo";
import PersonIcon from "./PersonIcon";

class MapWithMarkers extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      markers,
      activeMarkerId,
      onMarkerDragEnd,
      onMarkerPress,
      onMapPress,
      onMapLongPress
    } = this.props;
    return (
      <MapView
        style={styles.mapStyle}
        onPress={onMapPress}
        onLongPress={onMapLongPress}
        showsUserLocation
        followsUserLocation
        zoomEnabled
        rotateEnabled
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
    );
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
