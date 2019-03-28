import React from 'react';
import { LinearGradient } from 'expo';

class SharedGradient extends React.Component {
  render() {
    return (
      <LinearGradient colors={['#0048FF00', '#01C7E0']} style={this.props.style}>
        {this.props.children}
      </LinearGradient>
    );
  }
}

export default SharedGradient;
