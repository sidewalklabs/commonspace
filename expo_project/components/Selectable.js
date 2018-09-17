import PropTypes from 'prop-types';
import React from 'react';

import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import colors from '../constants/Colors';

import * as _ from 'lodash';

class Selectable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      height: 0,
    };
    this.onLayout = this.onLayout.bind(this);
  }

  // TODO (Ananta): Make this more React-y
  // Currently Selectable passes back its height when pressed, since the parent wants to scroll the amount
  // But that's a weird API for a child that should function without knowledge of its parents' desires
  onLayout(event) {
    this.setState({ height: event.nativeEvent.layout.height });
  }

  render() {
    const { onSelectablePress, selectedValue, selectedColor, title, options } = this.props;
    return (
      <View style={styles.container} onLayout={this.onLayout}>
        <Text style={styles.title}>{title}</Text>
        <ScrollView style={styles.selectable} horizontal showsHorizontalScrollIndicator={false}>
          {_.map(options, (option, index) => {
            const { value, label } = option;
            let selected = Array.isArray(selectedValue)
              ? _.includes(selectedValue, value)
              : value === selectedValue;
            return (
              <TouchableOpacity
                key={value}
                style={[
                  styles.selectableCell,
                  index === 0 && styles.firstCell,
                  selected && { backgroundColor: selectedColor },
                ]}
                onPress={e => {
                  onSelectablePress(value, this.state.height);
                }}>
                <Text style={[styles.pillText, selected && { color: 'white' }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  selectable: {
    flexDirection: 'row',
  },
  selectableCell: {
    borderWidth: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 3,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    padding: 5,
    marginRight: 5,
    marginTop: 10,
  },
  firstCell: {
    marginLeft: 20,
  },
  pillText: {
    fontFamily: 'monaco',
  },
  title: {
    marginBottom: 5,
    paddingHorizontal: 20,
  },
});

Selectable.propTypes = {
  onSelectablePress: PropTypes.func.isRequired,
  selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  selectedColor: PropTypes.string,
  title: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    }),
  ).isRequired,
};

Selectable.defaultProps = {
  selectedColor: colors.colorSecondary,
};

export default Selectable;
