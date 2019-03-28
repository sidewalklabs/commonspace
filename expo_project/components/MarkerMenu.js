import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import PropTypes from 'prop-types';

class MarkerMenu extends React.Component {
  render() {
    const { topLocation } = this.props;
    return (
      <Modal animationType="fade" visible transparent>
        <TouchableOpacity activeOpacity={1} style={styles.container} onPress={this.props.onClose}>
          <Card
            style={[
              styles.modalContent,
              topLocation && {
                position: 'absolute',
                top: Math.max(topLocation, 0),
                right: 0,
              },
            ]}>
            {this.props.onDeletePress && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  this.props.onDeletePress();
                  this.props.onClose();
                }}>
                <Text>Delete</Text>
              </TouchableOpacity>
            )}
            {this.props.onDuplicatePress && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  this.props.onDuplicatePress();
                  this.props.onClose();
                }}>
                <Text>Duplicate</Text>
              </TouchableOpacity>
            )}
          </Card>
        </TouchableOpacity>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    justifyContent: 'center',
    alignItems: 'stretch',
    width: 150,
  },
  button: {
    alignSelf: 'stretch',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

MarkerMenu.propTypes = {
  onClose: PropTypes.func,
  onDeletePress: PropTypes.func,
  onDuplicatePress: PropTypes.func,
  topLocation: PropTypes.number,
};

MarkerMenu.defaultProps = {
  onDeletePress: undefined,
  onDuplicatePress: undefined,
  topLocation: 0,
  onClose: () => null,
};

export default MarkerMenu;
