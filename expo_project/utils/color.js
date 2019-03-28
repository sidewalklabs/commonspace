import * as _ from 'lodash';
import { iconColors } from '../constants/Colors';

/* eslint-disable import/prefer-default-export */
export function getRandomIconColor(blacklistedColors = []) {
  // enforce next color is not current color
  const iconColorOptions = _.filter(
    _.values(iconColors),
    color => !_.includes(blacklistedColors, color),
  );
  return _.sample(iconColorOptions);
}
/* eslint-enable import/prefer-default-export */
