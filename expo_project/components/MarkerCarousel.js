import PropTypes from 'prop-types';
import React from 'react';

import PersonIcon from './PersonIcon';

import { FlatList, Platform, StyleSheet, TouchableOpacity } from 'react-native';

import * as _ from 'lodash';

const CAROUSEL_ICON_SIZE = 50;
const CAROUSEL_ITEM_PADDING = 12;
const CAROUSEL_ITEM_LENGTH = CAROUSEL_ICON_SIZE + 2 * CAROUSEL_ITEM_PADDING;

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 100 };

class MarkerCarousel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      viewableIndices: [],
    };
    this.onViewableItemsChanged = this.onViewableItemsChanged.bind(this);
  }

  onViewableItemsChanged({ viewableItems }) {
    // Note: only works on ios
    // Keep track of which markers are visible in the the header, so we don't scroll to them on select
    const viewableIndices = _.map(viewableItems, 'index');
    this.setState({
      viewableIndices,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // If user selects a marker, and it's not visible, scroll to it
    // Note that Adding / removing markers trigger their own animation (see: onContentSizeChange)
    // Therefore we stop if props.markers has changed
    if (
      this.props.markers === prevProps.markers &&
      this.props.activeMarkerId !== prevProps.activeMarkerId
    ) {
      const index = _.findIndex(this.props.markers, {
        id: this.props.activeMarkerId,
      });
      if (index > -1) {
        // Only scroll if the new selection isn't already visible
        if (!_.includes(this.state.viewableIndices, index)) {
          this.flatList.scrollToIndex({
            index,
            viewPosition: 0.5,
            animated: true,
          });
        }
      }
    }
  }

  render() {
    const { activeMarkerId, markers, onMarkerPress } = this.props;
    const onViewableItemsChanged = Platform.OS === 'ios' ? this.onViewableItemsChanged : undefined;
    return (
      <FlatList
        style={styles.container}
        data={markers}
        keyExtractor={item => item.id}
        extraData={activeMarkerId}
        horizontal
        removeClippedSubviews
        showsHorizontalScrollIndicator={false}
        ref={ref => (this.flatList = ref)}
        onContentSizeChange={(contentWidth, contentHeight) => {
          if (markers.length > 1) {
            // This is janky sometimes when there's only one item for some reason ...
            this.flatList.scrollToEnd({ animated: true });
          }
        }}
        getItemLayout={(data, index) => ({
          length: CAROUSEL_ITEM_LENGTH,
          offset: CAROUSEL_ITEM_LENGTH * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        renderItem={({ item, index }) => {
          const selected = item.id === activeMarkerId;
          return (
            <TouchableOpacity
              Index={index}
              style={[styles.cell, selected && { borderBottomColor: item.color }]}
              onPress={() => onMarkerPress(item.id)}>
              <PersonIcon backgroundColor={item.color} size={CAROUSEL_ICON_SIZE} />
            </TouchableOpacity>
          );
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
    borderBottomWidth: 1,
  },
  cell: {
    padding: CAROUSEL_ITEM_PADDING,
    // there's a border on selected cells, so put an inivisble border on all cells to keep cell height consistent
    borderBottomColor: 'transparent',
    borderBottomWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

MarkerCarousel.propTypes = {
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      coordinate: PropTypes.any,
      color: PropTypes.string,
      title: PropTypes.string,
      dateLabel: PropTypes.string,
      id: PropTypes.string,
    }),
  ).isRequired,
  activeMarkerId: PropTypes.string,
  onMarkerPress: PropTypes.func.isRequired,
};

export default MarkerCarousel;
