import PropTypes from "prop-types";
import React from "react";

import { StyleSheet, Text, TouchableOpacity } from "react-native";

class ColoredButton extends React.Component {
  render() {
    const { backgroundColor, color, onPress, label } = this.props;
    return (
      <TouchableOpacity
        style={[styles.button, { backgroundColor }]}
        onPress={onPress}
      >
        <Text style={[styles.text, { color }]}>{label}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#5B93D9",
    padding: 12,
    marginVertical: 20,
    justifyContent: "center",
    alignItems: "center"
  },
  text: { fontWeight: "bold" }
});

ColoredButton.propTypes = {
  color: PropTypes.string.isRequired
};

export default ColoredButton;
