import PropTypes from 'prop-types';
import React from 'react';
import {
  View, ScrollView, StyleSheet, Text, TouchableOpacity,
} from 'react-native';
import { Divider } from 'react-native-paper';
import * as _ from 'lodash';
import colors from '../constants/Colors';

class Selectable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      height: 0,
    };
    this.onLayout = this.onLayout.bind(this);
  }

  // TODO: Make this more React-y
  // Currently Selectable passes back its height when pressed,
  // since the parent wants to scroll the amount.
  // But that's a weird API for a child that should function
  // without knowledge of its parents' desires
  onLayout(event) {
    this.setState({ height: event.nativeEvent.layout.height });
  }

  render() {
    const {
      onSelectablePress,
      selectedValue,
      selectedColor,
      title,
      options,
      showDividers,
    } = this.props;
    return (
      <View onLayout={this.onLayout}>
        {showDividers && <Divider />}
        <Text style={styles.title}>{title}</Text>
        <ScrollView style={styles.selectable} horizontal showsHorizontalScrollIndicator={false}>
          {_.map(options, (option, index) => {
            const { value, label } = option;
            const selected = Array.isArray(selectedValue)
              ? _.includes(selectedValue, value)
              : value === selectedValue;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.tapTarget, index === 0 && { marginLeft: 20 }]}
                onPress={(e) => {
                  onSelectablePress(value, this.state.height);
                }}
              >
                <View
                  style={[styles.selectableCell, selected && { backgroundColor: selectedColor }]}
                >
                  <Text style={[styles.pillText, selected && { color: 'white' }]}>{label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  selectable: {
    flexDirection: 'row',
  },
  tapTarget: {
    marginRight: 10,
    paddingVertical: 16,
  },
  selectableCell: {
    borderWidth: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 3,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    padding: 4,
  },
  pillText: {
    fontFamily: 'monaco',
  },
  title: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
});

Selectable.propTypes = {
  onSelectablePress: PropTypes.func.isRequired,
  selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  selectedColor: PropTypes.string,
  title: PropTypes.string.isRequired,
  showDividers: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    }),
  ).isRequired,
};

Selectable.defaultProps = {
  selectedColor: colors.colorPrimary,
  showDividers: false,
  selectedValue: undefined,
};

export default Selectable;
