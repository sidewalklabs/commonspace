import { MapView } from "expo";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Button } from "react-native";
import { withNavigation, NavigationScreenProp } from "react-navigation";

interface Props {
  navigation: NavigationScreenProp<any, any>;
}

interface State {
  markerLocation: any;
  errorMessage?: string;
}

class HomeScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: "Tap map to add a pins"
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      markerLocation: null,
      errorMessage: undefined
    };
    this.setMarkerLocation = this.setMarkerLocation.bind(this);
  }

  setMarkerLocation(e: any) {
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
          <View style={styles.buttonWrapper}>
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
  buttonWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: {
        shadowColor: "black",
        shadowOpacity: 0.1,
        shadowRadius: 3
      }
    }),
    alignItems: "center",
    backgroundColor: "#fbfbfb",
    paddingVertical: 20
  }
});

export default withNavigation(HomeScreen);
