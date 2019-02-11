import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
} from 'react-native';
import { withNavigation } from 'react-navigation';
import color from 'color';
import SharedGradient from '../components/SharedGradient';
import OnboardingSlides from '../config/onboarding';
import Layout from '../constants/Layout';
import authStyles from '../stylesheets/auth';

const CAROUSEL_ITEM_WIDTH = Layout.window.width;

class IndicatorDots extends React.Component {
  render() {
    const { quantity, activeIndex } = this.props;
    return (
      <View style={styles.indicatorDotsContainer}>
        {Array.from(Array(quantity)).map((x, i) => (
          <TouchableOpacity key={i} activeOpacity={1} onPress={() => this.props.onPress(i)}>
            <View style={[styles.indicatorDot, i === activeIndex && styles.indicatorDotActive]} />
          </TouchableOpacity>
        ))}
      </View>
    );
  }
}

class OnboardingScreen extends React.Component {
  static navigationOptions = {
    headerTitle: '',
    headerLeft: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      indicatorIndex: 0,
    };
  }

  indexToScrollOffset = (index, width) => index * width;

  // For some reason, android width is ~0.000000001 off, so compare the truncated version
  scrollOffsetToIndex = (offset, width) => Math.trunc(offset) / Math.trunc(width);

  onIndicatorDotPress = index => {
    const offset = this.indexToScrollOffset(index, CAROUSEL_ITEM_WIDTH);
    this.carousel.scrollTo({ x: offset, animated: true });
  };

  handleScroll = event => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const indicatorIndex = this.scrollOffsetToIndex(scrollOffset, CAROUSEL_ITEM_WIDTH);

    if (indicatorIndex !== this.state.indicatorIndex) {
      this.setState({ indicatorIndex });
    }
  };

  render() {
    return (
      <SharedGradient style={authStyles.container}>
        <ScrollView
          ref={ref => (this.carousel = ref)}
          horizontal
          removeClippedSubviews
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onScroll={this.handleScroll}
          decelerationRate="fast"
          overScrollMode="never"
          scrollEventThrottle={16}>
          {OnboardingSlides.map((slide, i) => (
            <View style={styles.carouselItem} key={i}>
              <Image source={slide.imageSource} />
              <Text style={authStyles.title}>{slide.title}</Text>
              <Text style={authStyles.paragraph}>{slide.description}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.footer}>
          <TouchableHighlight
            underlayColor={color('#ffcf2b').darken(0.2)}
            style={[authStyles.cta, authStyles.primaryCta]}
            onPress={() => this.props.navigation.navigate('PreAuthScreen')}>
            <Text
              style={[authStyles.ctaCopy, authStyles.primaryCtaCopy, { paddingHorizontal: 20 }]}>
              GET STARTED
            </Text>
          </TouchableHighlight>
          <IndicatorDots
            quantity={OnboardingSlides.length}
            activeIndex={this.state.indicatorIndex}
            onPress={this.onIndicatorDotPress}
          />
        </View>
      </SharedGradient>
    );
  }
}

const styles = StyleSheet.create({
  carouselItem: {
    flex: 1,
    paddingHorizontal: 40,
    width: CAROUSEL_ITEM_WIDTH,
    alignItems: 'center',
    flexDirection: 'column',
  },
  footer: {
    flex: 0,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorDotsContainer: {
    flexDirection: 'row',
    marginVertical: 20,
  },
  indicatorDot: {
    backgroundColor: 'white',
    opacity: 0.5,
    borderRadius: 10,
    height: 6,
    width: 6,
    marginRight: 5,
  },
  indicatorDotActive: {
    opacity: 1,
  },
});

export default withNavigation(OnboardingScreen);
