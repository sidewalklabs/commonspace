import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import PropTypes from 'prop-types';
import Layout from '../constants/Layout';

class NoteModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      text: props.initialValue,
    };
  }

  render() {
    return (
      <Modal animationType="none" visible>
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
            <Text style={styles.title}>Add a note</Text>
            <Text style={styles.subtitle}>Avoid using personally identifying information</Text>
            <TextInput
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
  modalHeader: {
    paddingTop: Layout.header.height / 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBody: {
    padding: 20,
  },
  title: {
    color: '#333333',
    fontFamily: 'product-bold',
    fontSize: 24,
  },
  subtitle: {
    color: '#333333',
    fontFamily: 'product',
    fontSize: 17,
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
