import PropTypes from 'prop-types';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

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
        <Feather name="arrow-left" size={30} color="white" />
      </TouchableOpacity>
    );
  }
}

BackArrow.propTypes = {
  goBack: PropTypes.func.isRequired,
};

export default BackArrow;
