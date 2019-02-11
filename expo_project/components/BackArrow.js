import PropTypes from 'prop-types';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Icon } from 'expo';

class BackArrow extends React.Component {
  render() {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          this.props.goBack();
        }}
        style={{
          marginLeft: 10,
        }}>
        <Icon.Feather name="arrow-left" size={30} color="white" />
      </TouchableOpacity>
    );
  }
}

BackArrow.propTypes = {
  goBack: PropTypes.func.isRequired,
};

export default BackArrow;
