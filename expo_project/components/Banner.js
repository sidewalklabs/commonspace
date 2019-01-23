import PropTypes from 'prop-types';
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from 'react-native-paper';
import Theme from '../constants/Theme';

class Banner extends React.Component {
  render() {
    const { title, description, cta, ctaOnPress } = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.footer}>
          <Button
            raised
            style={styles.button}
            onPress={ctaOnPress}
            color="#ffcf2b"
            theme={{ ...Theme, roundness: 12 }}>
            <Text style={styles.ctaCopy}>{cta}</Text>
          </Button>
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
    height: 48,
    lineHeight: 30,
    letterSpacing: 0.5,
  },
  button: {
    alignItems: 'center',
    flexDirection: 'column',
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
