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
      timer: SURVEY_LENGTH_MS
    };
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
    fontSize: 24,
    fontFamily: Theme.fonts.medium
  }
});

export default SurveyHeader;
