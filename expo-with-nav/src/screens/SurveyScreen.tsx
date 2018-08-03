import { MapView } from "expo";
import React from "react";
import {
  Picker,
  ScrollView,
  Slider,
  StyleSheet,
  Switch,
  Text,
  View
} from "react-native";
import { Button } from "react-native";
import { withNavigation, NavigationScreenProp } from "react-navigation";

import * as firebase from "firebase";

interface Props {
  navigation: NavigationScreenProp<any, any>;
}

class SurveyScreen extends React.Component<Props, any> {
  static navigationOptions = {
    title: "Survey"
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      age: 30,
      isIdle: false,
      isRunning: false,
      isCounterTraffic: false,
      isRidingOnSidewalk: false,
      hasDog: false,
      isWithoutHelmet: false,
      isConsuming: false,
      isConversing: false,
      isCommercial: false,
      isElectronics: false,
      gender: "female",
      mode: "pedestrian",
      group: "alone",
      posture: "standing"
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.setSurveyData = this.setSurveyData.bind(this);
  }

  onSubmit() {
    const randomId = Math.floor(Math.random() * Math.floor(100000));
    const location = this.props.navigation.getParam("location", undefined);
    const latitude = location ? location.latitude : null;
    const longitude = location ? location.longitude : null;
    firebase
      .database()
      .ref("users/" + randomId)
      .set({ ...this.state, latitude, longitude });
    this.props.navigation.navigate("Home");
  }

  setSurveyData(key: string, value: string | number | boolean) {
    this.setState({ [key]: value });
  }

  render() {
    const location = this.props.navigation.getParam("location", undefined);

    return (
      <View style={styles.container}>
        {location && (
          <MapView
            style={{ flex: 0.25 }}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.001,
              longitudeDelta: 0.001
            }}
            cacheEnabled
          >
            <MapView.Marker coordinate={location} pinColor="green" />
          </MapView>
        )}
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.body}>
            <Text style={styles.title}>Gender:</Text>
            <Picker
              style={styles.onePicker}
              itemStyle={styles.onePickerItem}
              selectedValue={this.state.gender}
              onValueChange={gender => this.setSurveyData("gender", gender)}
            >
              <Picker.Item label="female" value="female" />
              <Picker.Item label="male" value="male" />
              <Picker.Item label="gender unknown" value="unknown" />
            </Picker>
            <Text style={styles.title}>Age:</Text>
            <Text style={styles.subtitle}>{this.state.age}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={10}
              value={this.state.age}
              onValueChange={age => this.setSurveyData("age", age)}
            />
            <Text style={styles.title}>Mode:</Text>
            <Picker
              style={styles.onePicker}
              itemStyle={styles.onePickerItem}
              selectedValue={this.state.mode}
              onValueChange={mode => this.setSurveyData("mode", mode)}
            >
              <Picker.Item label="pedestrian" value="pedestrian" />
              <Picker.Item label="bicyclist" value="bicyclist" />
            </Picker>
            {this.state.mode === "bicyclist" && (
              <Text style={styles.title}>Cyclists:</Text>
            )}
            {this.state.mode === "bicyclist" && (
              <View style={styles.cellWrapper}>
                <View style={styles.cell}>
                  <Text style={styles.subtitle}>
                    Cyclists riding counter to traffic
                  </Text>
                  <Switch
                    value={this.state.isCounterTraffic}
                    onValueChange={isCounterTraffic =>
                      this.setSurveyData("isCounterTraffic", isCounterTraffic)
                    }
                  />
                </View>
                <View style={styles.cell}>
                  <Text style={styles.subtitle}>
                    Cyclists riding on the sidewalk
                  </Text>
                  <Switch
                    value={this.state.isRidingOnSidewalk}
                    onValueChange={isRidingOnSidewalk =>
                      this.setSurveyData(
                        "isRidingOnSidewalk",
                        isRidingOnSidewalk
                      )
                    }
                  />
                </View>
                <View style={styles.cell}>
                  <Text style={styles.subtitle}>Cyclists without a helmet</Text>
                  <Switch
                    value={this.state.isWithoutHelmet}
                    onValueChange={isWithoutHelmet =>
                      this.setSurveyData("isWithoutHelmet", isWithoutHelmet)
                    }
                  />
                </View>
              </View>
            )}
            <Text style={styles.title}>Groups:</Text>
            <Picker
              style={styles.onePicker}
              itemStyle={styles.onePickerItem}
              selectedValue={this.state.group}
              onValueChange={group => this.setSurveyData("group", group)}
            >
              <Picker.Item label="alone" value="alone" />
              <Picker.Item label="pair" value="pair" />
              <Picker.Item label="group" value="group" />
              <Picker.Item label="crowd" value="crowd" />
            </Picker>
            <Text style={styles.title}>Posture:</Text>
            <Picker
              style={styles.onePicker}
              itemStyle={styles.onePickerItem}
              selectedValue={this.state.posture}
              onValueChange={posture => this.setSurveyData("posture", posture)}
            >
              <Picker.Item label="Standing" value="standing" />
              <Picker.Item label="Leaning" value="leaning" />
              <Picker.Item label="Lying" value="lying" />
              <Picker.Item label="Sitting" value="sitting" />
              <Picker.Item
                label="Sitting on the ground"
                value="groundSitting"
              />
            </Picker>
            <Text style={styles.title}>Activities:</Text>
            <View style={styles.cellWrapper}>
              <View style={styles.cell}>
                <Text style={styles.subtitle}>Commercial</Text>
                <Switch
                  value={this.state.isCommercial}
                  onValueChange={isCommercial =>
                    this.setSurveyData("isCommercial", isCommercial)
                  }
                />
              </View>
              <View style={styles.cell}>
                <Text style={styles.subtitle}>Consuming</Text>
                <Switch
                  value={this.state.isConsuming}
                  onValueChange={isConsuming =>
                    this.setSurveyData("isConsuming", isConsuming)
                  }
                />
              </View>
              <View style={styles.cell}>
                <Text style={styles.subtitle}>Conversing</Text>
                <Switch
                  value={this.state.isConversing}
                  onValueChange={isConversing =>
                    this.setSurveyData("isConversing", isConversing)
                  }
                />
              </View>
              <View style={styles.cell}>
                <Text style={styles.subtitle}>Using electronics</Text>
                <Switch
                  value={this.state.isElectronics}
                  onValueChange={isElectronics =>
                    this.setSurveyData("isElectronics", isElectronics)
                  }
                />
              </View>
              <View style={styles.cell}>
                <Text style={styles.subtitle}>Idle</Text>
                <Switch
                  value={this.state.isIdle}
                  onValueChange={isIdle => this.setSurveyData("isIdle", isIdle)}
                />
              </View>
              <View style={styles.cell}>
                <Text style={styles.subtitle}>Has dog</Text>
                <Switch
                  value={this.state.hasDog}
                  onValueChange={hasDog => this.setSurveyData("hasDog", hasDog)}
                />
              </View>
              <View style={styles.cell}>
                <Text style={styles.subtitle}>Running</Text>
                <Switch
                  value={this.state.isRunning}
                  onValueChange={isRunning =>
                    this.setSurveyData("isRunning", isRunning)
                  }
                />
              </View>
            </View>
          </View>
        </ScrollView>
        <Button
          onPress={this.onSubmit}
          title="Submit"
          color="green"
          accessibilityLabel="Submit"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10
  },
  subtitle: {
    marginTop: 20,
    marginBottom: 10
  },
  scrollContainer: {
    flex: 1
  },
  body: {
    alignItems: "center",
    padding: 20
  },
  onePicker: {
    width: 200,
    height: 44,
    borderColor: "green",
    borderWidth: 1
  },
  onePickerItem: {
    height: 44,
    color: "red"
  },
  slider: {
    flex: 1,
    alignSelf: "stretch"
  },
  cellWrapper: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  cell: {
    flexBasis: "50%",
    alignItems: "center"
  }
});

export default withNavigation(SurveyScreen);
