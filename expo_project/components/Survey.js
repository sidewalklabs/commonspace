import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Selectable from '../components/Selectable';
import * as _ from 'lodash';

import QUESTION_CONFIG from '../config/questions';

class Survey extends React.Component {
  render() {
    const { activeMarker, onSelect } = this.props;
    return (
      <View>
        {_.map(QUESTION_CONFIG, question => {
          const { questionKey, questionLabel, options } = question;
          return (
            <Selectable
              key={questionKey}
              onSelectablePress={(value, selectableHeight) =>
                onSelect(activeMarker.id, questionKey, value, selectableHeight)
              }
              selectedValue={activeMarker[questionKey]}
              selectedColor={activeMarker.color}
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
  onSelect: PropTypes.func.isRequired,
};

export default Survey;
