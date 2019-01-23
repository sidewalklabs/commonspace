import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Button, Subheading, Title } from 'react-native-paper';
import { LinearGradient } from 'expo';
import Theme from '../constants/Theme';
import Layout from '../constants/Layout';
import { WebBrowser } from 'expo';

import OnboardingSlides from '../config/onboarding';

const CAROUSEL_ITEM_WIDTH = Layout.window.width;

class IndicatorDots extends React.Component {
  render() {
    const { quantity, activeIndex } = this.props;
    return (
      <View style={styles.indicatorDotsContainer}>
        {Array.from(Array(quantity)).map((x, i) => {
          return (
            <TouchableOpacity key={i} activeOpacity={1} onPress={() => this.props.onPress(i)}>
              <View style={[styles.indicatorDot, i === activeIndex && styles.indicatorDotActive]} />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
}

class OnboardingScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      indicatorIndex: 0,
    };
  }

  indexToScrollOffset = (index, width) => {
    return index * width;
  };

  scrollOffsetToIndex = (offset, width) => {
    // For some reason, android width is ~0.000000001 off, so compare the truncated version
    return Math.trunc(offset) / Math.trunc(width);
  };

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
      <View style={styles.container}>
        <LinearGradient colors={['#0048FF00', '#01C7E0']} style={styles.graddientContainer}>
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
                <Title style={styles.title}>{slide.title}</Title>
                <Subheading style={styles.description}>{slide.description}</Subheading>
              </View>
            ))}
          </ScrollView>
          <View style={styles.footer}>
            <Button
              style={{ height: 48 }}
              raised
              color="#ffcf2b"
              theme={{ ...Theme, roundness: 12 }}
              onPress={() => this.props.navigation.navigate('AuthScreen')}>
              <Text style={styles.buttonText}>GET STARTED</Text>
            </Button>
            <IndicatorDots
              quantity={OnboardingSlides.length}
              activeIndex={this.state.indicatorIndex}
              onPress={this.onIndicatorDotPress}
            />
          </View>
        </LinearGradient>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonText: {
    fontFamily: 'product-medium',
    fontSize: 16,
    height: 48,
    lineHeight: 30,
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    backgroundColor: '#008FEE',
  },
  graddientContainer: {
    flex: 1,
  },
  carouselItem: {
    flex: 1,
    paddingHorizontal: 40,
    paddingVertical: 80,
    width: CAROUSEL_ITEM_WIDTH,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'product-bold',
    fontSize: 24,
    marginVertical: 20,
  },
  description: {
    color: 'white',
    textAlign: 'center',
    opacity: 0.8,
  },
  footer: {
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
