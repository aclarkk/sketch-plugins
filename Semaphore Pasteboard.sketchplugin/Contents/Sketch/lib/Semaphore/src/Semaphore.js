// @flow

import Color from './classes/Color';
import Gradient from './classes/Gradient';
import Point from './classes/Point';
import Rect from './classes/Rect';

const Semaphore = {
  Color: Color,
  Gradient: Gradient,
  Point: Point,
  Rect: Rect,
};

// Browserify's standalone flag requires `module.exports` instead of ES6 module
// syntax, which is used elsewhere in this library.
module.exports = Semaphore;
