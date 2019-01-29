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
    fontFamily: 'product',
    fontSize: 17,
    color: 'white',
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 24,
  },
  formContainer: {
    borderRadius: 10,
    backgroundColor: 'white',
    padding: 10,
    alignSelf: 'stretch',
    marginVertical: 12,
  },
  cta: {
    borderRadius: 10,
    height: 48,
    alignSelf: 'stretch',
    backgroundColor: '#ffffff00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryCta: {
    backgroundColor: '#ffcf2b',
    marginBottom: 20,
  },
  ctaCopy: {
    fontFamily: 'product-medium',
    textAlign: 'center',
    fontSize: 16,
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
