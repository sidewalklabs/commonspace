import PropTypes from "prop-types";
import React from "react";

import { StyleSheet, Text, TouchableOpacity } from "react-native";

class ColoredButton extends React.Component {
  render() {
    const { style, backgroundColor, color, onPress, label } = this.props;
    return (
      <TouchableOpacity
        style={[styles.button, { ...style, backgroundColor }]}
        onPress={onPress}
      >
        <Text style={[styles.text, { color }]}>{label}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    marginVertical: 20,
    justifyContent: "center",
    alignItems: "center"
  },
  text: { fontWeight: "bold" }
});

ColoredButton.propTypes = {
  style: PropTypes.object,
  color: PropTypes.string,
  backgroundColor: PropTypes.string
};

ColoredButton.defaultProps = {
  style: {},
  backgroundColor: "blue",
  color: "#5B93D9"
};

export default ColoredButton;
