import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Selectable from '../components/Selectable';
import * as _ from 'lodash';
import QUESTION_CONFIG from '../config/questions';

class Survey extends React.Component {
  onSelectPress = (key, value, selectedValue, selectableHeight) => {
    const { activeMarker, onSelect } = this.props;
    // If editing a response, don't scroll
    const heightToScroll = selectedValue ? 0 : selectableHeight;
    onSelect(activeMarker.dataPointId, key, value, heightToScroll);
  };

  onMultiselectPress = (key, value, selectedValue) => {
    const { activeMarker, onSelect } = this.props;
    const valueArray = selectedValue || [];
    // if value is already selected, deselect it.
    // else, select it
    if (_.includes(valueArray, value)) {
      _.pull(valueArray, value);
    } else {
      valueArray.push(value);
    }
    onSelect(activeMarker.dataPointId, key, valueArray, 0);
  };

  render() {
    const { activeMarker, fields } = this.props;
    const questions = _.filter(
      QUESTION_CONFIG,
      ({ questionKey }) => fields.indexOf(questionKey) !== -1,
    );
    return (
      <View>
        {_.map(questions, question => {
          const { questionKey, questionLabel, questionType, options } = question;
          const selectedValue = activeMarker[questionKey];
          return (
            <Selectable
              key={questionKey}
              onSelectablePress={(value, selectableHeight) =>
                questionType === 'multiselect'
                  ? this.onMultiselectPress(questionKey, value, selectedValue)
                  : this.onSelectPress(questionKey, value, selectedValue, selectableHeight)
              }
              selectedValue={selectedValue}
              selectedColor={activeMarker.color}
              showDividers
              title={questionLabel}
              options={options}
            />
          );
        })}
        {activeMarker.note && (
          <View style={styles.noteContainer}>
            <Text style={styles.noteTitle}>Note</Text>
            <Text style={[styles.noteBody, { color: activeMarker.color }]}>
              {activeMarker.note}
            </Text>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  noteContainer: { paddingVertical: 10 },
  noteTitle: {
    // match selectable style
    marginBottom: 5,
    paddingHorizontal: 20,
  },
  noteBody: {
    fontFamily: 'monaco',
    marginVertical: 10,
    marginHorizontal: 20,
  },
});

Survey.propTypes = {
  activeMarker: PropTypes.any.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default Survey;
