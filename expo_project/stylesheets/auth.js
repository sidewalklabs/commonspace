import { StyleSheet } from 'react-native';
import Layout from '../constants/Layout';

// Shared styles among login screens
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#008FEE',
    alignItems: 'center',
    paddingTop: Layout.header.height,
  },
  content: {
    flex: 1,
    padding: 20,
    alignSelf: 'stretch',
  },
  title: {
    fontSize: 24,
    fontFamily: 'product-bold',
    textAlign: 'center',
    marginBottom: 24,
    color: 'white',
  },
  paragraph: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 24,
    color: 'white',
    opacity: 0.8,
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 10,
    alignSelf: 'stretch',
    marginVertical: 12,
    // Match button styling from paper libary
    marginHorizontal: 4,
    borderRadius: 10,
  },
  cta: {
    alignSelf: 'stretch',
  },
  ctaCopy: {
    fontFamily: 'product-medium',
    fontSize: 16,
    height: 48,
    lineHeight: 30,
    letterSpacing: 0.5,
    margin: 0,
    padding: 0,
    opacity: 0.8,
  },
  primaryCtaCopy: {
    opacity: 1,
  },
  footer: {
    flex: 0,
    padding: 20,
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },
});

export default styles;
