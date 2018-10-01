import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Button, Subheading, Title } from 'react-native-paper';
import { Icon, LinearGradient } from 'expo';
import Theme from '../constants/Theme';
import Layout from '../constants/Layout';

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
    return Math.trunc(offset / width);
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
        <LinearGradient colors={['#4e87ec', '#0c3987']} style={styles.graddientContainer}>
          <ScrollView
            ref={ref => (this.carousel = ref)}
            horizontal
            removeClippedSubviews
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            onScroll={this.handleScroll}
            scrollEventThrottle={16}>
            {OnboardingSlides.map((slide, i) => (
              <View style={styles.carouselItem} key={i}>
                <Icon.Ionicons name={slide.ionicon} size={160} color="#f9cf52" />
                <Title style={styles.title}>{slide.title}</Title>
                <Subheading style={styles.description}>{slide.description}</Subheading>
                {slide.linkToWebview && (
                  <Button
                    onPress={() =>
                      this.props.navigation.navigate('WebViewScreen', {
                        uri: slide.linkToWebview.uri,
                        title: slide.linkToWebview.webviewTitle,
                      })
                    }>
                    {slide.linkToWebview.cta}
                  </Button>
                )}
              </View>
            ))}
          </ScrollView>
          <View style={styles.footer}>
            <Button
              raised
              color="#f9cf52"
              theme={{ ...Theme, roundness: 100 }}
              onPress={() => this.props.navigation.navigate('AuthScreen')}>
              Get Started
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
  container: {
    flex: 1,
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
  },
  title: {
    color: 'white',
    textAlign: 'center',
    fontSize: 28,
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
    borderRadius: 5,
    height: 5,
    width: 5,
    marginRight: 5,
  },
  indicatorDotActive: {
    opacity: 1,
  },
});

export default withNavigation(OnboardingScreen);
