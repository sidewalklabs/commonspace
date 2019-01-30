import { Dimensions } from 'react-native';
import { Header } from 'react-navigation';

const { width, height } = Dimensions.get('window');

export default {
  window: {
    width,
    height,
  },
  header: {
    height: Header.HEIGHT,
  },
  drawer: {
    height: height - Header.HEIGHT,
    width,
  },
  isSmallDevice: width < 375,
};
