import PropTypes from 'prop-types';
import React from 'react';
import {
  View, StyleSheet, Text, TouchableHighlight,
} from 'react-native';
import color from 'color';

class Banner extends React.Component {
  render() {
    const {
      title, description, cta, ctaOnPress,
    } = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.footer}>
          <TouchableHighlight
            underlayColor={color('#ffcf2b').darken(0.2)}
            style={styles.button}
            onPress={ctaOnPress}
          >
            <Text style={styles.ctaCopy}>{cta}</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 24,
    marginRight: 24,
    flex: 1,
  },
  title: {
    color: '#333333',
    textAlign: 'center',
    fontFamily: 'product-bold',
    fontSize: 36,
    lineHeight: 42,
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#333333',
    fontSize: 16,
    lineHeight: 20,
  },
  ctaCopy: {
    fontFamily: 'product-medium',
    fontSize: 16,
    lineHeight: 30,
    letterSpacing: 0.5,
  },
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ffcf2b',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

Banner.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  cta: PropTypes.string.isRequired,
  ctaOnPress: PropTypes.func.isRequired,
};

export default Banner;
