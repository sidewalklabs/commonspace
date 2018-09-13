import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import PropTypes from 'prop-types';

class NoteModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      text: props.initialValue,
    };
  }

  render() {
    return (
      <Modal animationType="none" visible={true}>
        <View style={styles.modalHeader}>
          <Button
            onPress={() => {
              this.props.onClose(this.props.initialValue);
            }}>
            <Text>Cancel</Text>
          </Button>
          <Button
            onPress={() => {
              this.props.onClose(this.state.text);
            }}>
            <Text>Done</Text>
          </Button>
        </View>
        <View style={styles.modalBody}>
          <View>
            <TextInput
              label="Add a note"
              returnKeyLabel="Done"
              autoFocus
              value={this.state.text}
              onChangeText={text => this.setState({ text })}
              onSubmitEditing={() => {
                this.props.onClose(this.state.text);
              }}
            />
            <View style={styles.buttonWrapper}>
              <Button
                raised
                primary
                dark
                onPress={() => {
                  this.props.onClose(this.state.text);
                }}>
                <Text>Done</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBody: {
    padding: 20,
  },
  buttonWrapper: {
    marginTop: 20,
  },
});

NoteModal.propTypes = {
  initialValue: PropTypes.string,
  onClose: PropTypes.func,
};

NoteModal.defaultProps = {
  initialValue: '',
  onClose: () => null,
};

export default NoteModal;
