import { Icon } from 'expo';
import PropTypes from 'prop-types';
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';

class PersonIcon extends React.Component {
  render() {
    const { size, backgroundColor, shadow } = this.props;
    return (
      <View
        style={[
          styles.container,
          shadow && styles.shadow,
          {
            backgroundColor,
            height: size,
            width: size,
            borderRadius: size / 2,
          },
        ]}>
        <Icon.Ionicons name="md-person" size={size * 0.5} color="white" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
      },
      android: {
        // TODO: verify
        elevation: 20,
      },
    }),
  },
});

PersonIcon.propTypes = {
  size: PropTypes.number.isRequired,
  backgroundColor: PropTypes.string,
  shadow: PropTypes.bool,
};

PersonIcon.defaultProps = {
  backgroundColor: 'white',
  shadow: false,
};

export default PersonIcon;
