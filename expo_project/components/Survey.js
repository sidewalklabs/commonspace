import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Selectable from "../components/Selectable";
import * as _ from "lodash";

import QUESTION_CONFIG from "../config/questions";

class Survey extends React.Component {
  render() {
    const { activeMarker, onSelect } = this.props;
    return (
      <View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{activeMarker.title}</Text>
          <Text>{activeMarker.dateLabel}</Text>
        </View>
        {_.map(QUESTION_CONFIG, question => {
          const { questionKey, questionLabel, options } = question;
          return (
            <Selectable
              key={questionKey}
              onSelectablePress={(value, selectableHeight) =>
                onSelect(activeMarker.id, questionKey, value, selectableHeight)
              }
              selectedValue={activeMarker[questionKey]}
              title={questionLabel}
              options={options}
            />
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  titleContainer: { paddingVertical: 10 },
  title: { fontWeight: "bold" }
});

Survey.propTypes = {
  onSelect: PropTypes.func.isRequired
};

export default Survey;
