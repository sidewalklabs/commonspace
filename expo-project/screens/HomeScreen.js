import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { KeepAwake, MapView, Constants, Location, Permissions } from "expo";
import { Button } from "react-native";
import { withNavigation } from "react-navigation";

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: "Tap map to add a pin"
  };

  constructor(props) {
    super(props);

    this.state = {
      markerLocation: null,
      errorMessage: null
    };
    this.setMarkerLocation = this.setMarkerLocation.bind(this);
  }

  setMarkerLocation(e) {
    this.setState({ markerLocation: e.nativeEvent.coordinate });
  }

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={{ flex: 1 }}
          onPress={this.setMarkerLocation}
          showsUserLocation
          followsUserLocation
        >
          {this.state.markerLocation && (
            <MapView.Marker
              coordinate={this.state.markerLocation}
              pinColor="green"
              draggable
              onDragEnd={this.setMarkerLocation}
            />
          )}
        </MapView>
        {this.state.markerLocation && (
          <View style={styles.tabBarInfoContainer}>
            <Button
              onPress={() => {
                this.props.navigation.navigate("Survey", {
                  location: this.state.markerLocation
                });
              }}
              title="Start survey"
              color="green"
              accessibilityLabel="Start survey"
            />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  tabBarInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: {
        elevation: 20
      }
    }),
    alignItems: "center",
    backgroundColor: "#fbfbfb",
    paddingVertical: 20
  },
  tabBarInfoText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    textAlign: "center"
  }
});

export default withNavigation(HomeScreen);
