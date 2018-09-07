import React from "react";
import { Text, StyleSheet } from "react-native";
import Theme from "../constants/Theme";
import moment from "moment";

// TODO: verify that all surveys are the same length
const SURVEY_LENGTH_MS = 600000; // 10 minutes

class SurveyHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timer: SURVEY_LENGTH_MS
    };
  }

  componentDidMount() {
    this.interval = setInterval(
      () => this.setState({ timer: this.state.timer - 1000 }),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const { timer } = this.state;
    // for flat numbers (e.g. 60000) seconds = 0, but we want to render "00"
    const seconds = moment.duration(timer).seconds() || "00";
    const minutes = moment.duration(timer).minutes() || "00";
    return (
      <Text style={styles.text}>
        {minutes}:{seconds}
      </Text>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 24,
    fontFamily: Theme.fonts.medium
  }
});

export default SurveyHeader;
