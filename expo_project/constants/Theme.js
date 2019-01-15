import { DefaultTheme } from 'react-native-paper';

export default {
  ...DefaultTheme,
  roundness: 5,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4A90E2',
    accent: '#1C4442',
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    light: 'System',
    thin: 'System',
  },
};
