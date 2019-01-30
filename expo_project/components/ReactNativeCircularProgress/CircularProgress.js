import React from 'react';
import PropTypes from 'prop-types';
import { View, ViewPropTypes } from 'react-native';
import { Svg } from 'expo';

export default class CircularProgress extends React.PureComponent {
  polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  circlePath = (x, y, radius, startAngle, endAngle) => {
    const start = this.polarToCartesian(x, y, radius, endAngle * 0.9999);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    const d = ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y];
    return d.join(' ');
  };

  clampFill = fill => Math.min(100, Math.max(0, fill));

  render() {
    const {
      size,
      width,
      backgroundWidth,
      tintColor,
      backgroundColor,
      style,
      rotation,
      lineCap,
      arcSweepAngle,
      fill,
      children,
    } = this.props;

    const backgroundPath = this.circlePath(
      size / 2,
      size / 2,
      size / 2 - width / 2,
      0,
      arcSweepAngle,
    );
    const circlePath = this.circlePath(
      size / 2,
      size / 2,
      size / 2 - width / 2,
      0,
      arcSweepAngle * this.clampFill(fill) / 100,
    );
    const offset = size - width * 2;

    const childContainerStyle = {
      position: 'absolute',
      left: width,
      top: width,
      width: offset,
      height: offset,
      borderRadius: offset / 2,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    };

    return (
      <View style={style}>
        <Svg width={size} height={size} style={{ backgroundColor: 'transparent' }}>
          <Svg.G rotation={rotation} originX={size / 2} originY={size / 2}>
            {backgroundColor && (
              <Svg.Path
                d={backgroundPath}
                stroke={backgroundColor}
                strokeWidth={backgroundWidth || width}
                strokeLinecap={lineCap}
                fill="transparent"
              />
            )}
            <Svg.Path
              d={circlePath}
              stroke={tintColor}
              strokeWidth={width}
              strokeLinecap={lineCap}
              fill="transparent"
            />
          </Svg.G>
        </Svg>
        {children && <View style={childContainerStyle}>{children(fill)}</View>}
      </View>
    );
  }
}

CircularProgress.propTypes = {
  style: ViewPropTypes.style,
  size: PropTypes.number.isRequired,
  fill: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  backgroundWidth: PropTypes.number,
  tintColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  rotation: PropTypes.number,
  lineCap: PropTypes.string,
  arcSweepAngle: PropTypes.number,
  children: PropTypes.func,
};

CircularProgress.defaultProps = {
  style: {},
  backgroundWidth: 0,
  backgroundColor: 'transparent',
  tintColor: 'black',
  rotation: 90,
  lineCap: 'butt',
  arcSweepAngle: 360,
  children: undefined,
};
