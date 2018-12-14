import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, Button } from 'react-native-paper';
import PropTypes from 'prop-types';

class MarkerMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      text: props.initialValue,
    };
  }

  render() {
    const { topLocation } = this.props;
    return (
      <Modal animationType="fade" visible={true} transparent={true}>
        <TouchableOpacity activeOpacity={1} style={styles.container} onPress={this.props.onClose}>
          <Card
            style={[
              styles.modalCotent,
              topLocation && {
                position: 'absolute',
                top: Math.max(topLocation, 0),
                right: 0,
              },
            ]}>
            {this.props.onDeletePress && (
              <Button
                onPress={() => {
                  this.props.onDeletePress();
                  this.props.onClose();
                }}>
                <Text>Delete</Text>
              </Button>
            )}
            {this.props.onDuplicatePress && (
              <Button
                onPress={() => {
                  this.props.onDuplicatePress();
                  this.props.onClose();
                }}>
                <Text>Duplicate</Text>
              </Button>
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
  modalCotent: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    width: 150,
  },
});

MarkerMenu.propTypes = {
  onClose: PropTypes.func,
  onDeletePress: PropTypes.func,
  onDuplicatePress: PropTypes.func,
  topLocation: PropTypes.number,
};

MarkerMenu.defaultProps = {
  onClose: () => null,
};

export default MarkerMenu;
