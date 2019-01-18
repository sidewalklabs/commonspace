import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import * as _ from 'lodash';
import Theme from '../constants/Theme';

class Tab extends React.Component {
  render() {
    const { selected, label, onPress } = this.props;

    return (
      <TouchableOpacity style={[styles.tab, selected && styles.activeTab]} onPress={onPress}>
        <Text style={[styles.tabText]}>{label}</Text>
      </TouchableOpacity>
    );
  }
}

class SegmentedControl extends React.Component {
  constructor(props) {
    super(props);
  }

  setActive = label => {
    if (this.props.activeTab !== label) {
      this.props.onTabSelect(label);
    }
  };

  render() {
    const { labels, activeTab } = this.props;
    return (
      <View style={styles.tabs}>
        {_.map(labels, label => (
          <Tab selected={activeTab === label} label={label} onPress={() => this.setActive(label)} />
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabs: {
    flex: 0,
    flexDirection: 'row',
  },
  tab: {
    padding: 20,
    flex: 1,
    borderBottomColor: '#bbb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomColor: Theme.colors.primary,
    borderBottomWidth: 2,
  },
  tabText: {
    fontFamily: 'roboto-medium',
    fontWeight: 'medium',
    color: Theme.colors.primary,
  },
});

export default SegmentedControl;
