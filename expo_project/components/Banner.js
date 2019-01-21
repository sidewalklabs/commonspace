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
        <Button
          primary
          raised
          style={styles.button}
          onPress={ctaOnPress}
          theme={{ ...Theme, roundness: 20 }}>
          <Text style={styles.ctaCopy}>{cta}</Text>
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'product-medium',
    textAlign: 'center',
    fontSize: 50,
    marginBottom: 30,
  },
  description: {
    textAlign: 'center',
    marginBottom: 30,
  },
  ctaCopy: {
    fontSize: 20,
    color: 'white',
    marginBottom: 30,
  },
});

Banner.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  cta: PropTypes.string.isRequired,
  ctaOnPress: PropTypes.func.isRequired,
};

export default Banner;
