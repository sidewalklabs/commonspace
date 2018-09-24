import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Theme from '../constants/Theme';
import moment from 'moment';

// TODO: verify that all surveys are the same length
const SURVEY_LENGTH_MS = 600000; // 10 minutes

class SurveyHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timer: SURVEY_LENGTH_MS,
    };
    this.state = { timer: SURVEY_LENGTH_MS };
    // On android, we get an error for using a long timer See https://github.com/facebook/react-native/issues/12981
    // For now, just hide it from the user
    console.ignoredYellowBox = ['Setting a timer'];
  }

  componentDidMount() {
    this.interval = setInterval(() => this.setState({ timer: this.state.timer - 1000 }), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return <Text style={styles.text}>{moment.utc(this.state.timer).format('mm:ss')}</Text>;
  }
}

const styles = StyleSheet.create({
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
    fontFamily: Theme.fonts.medium,
  },
});

export default SurveyHeader;
