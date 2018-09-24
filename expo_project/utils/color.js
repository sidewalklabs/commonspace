import { iconColors } from '../constants/Colors';
import * as _ from 'lodash';

export function getRandomIconColor(blacklistedColors = []) {
  // enforce next color is not current color
  const iconColorOptions = _.filter(
    _.values(iconColors),
    color => !_.includes(blacklistedColors, color),
  );
  return _.sample(iconColorOptions);
}
