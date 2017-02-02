// @flow

import Color from './Color';
import Point from './Point';

function convertSemaphoreGradientType(type: SemaphoreGradientType): MSGradientType {
  if (type === 'linear') {
    return 0;
  } else {
    return 1;
  }
}

function convertMSGradientType(type: MSGradientType): SemaphoreGradientType {
  if (type === 0) {
    return 'linear';
  } else {
    return 'radial';
  }
}

class Gradient {
  type: SemaphoreGradientType;
  startColor: Color;
  startPosition: Point;
  endColor: Color;
  endPosition: Point;

  constructor(properties: {
    type: SemaphoreGradientType,
    startColor: Color,
    startPosition: Point,
    endColor: Color,
    endPosition: Point,
  }) {
    this.type = properties.type;
    this.startColor = properties.startColor;
    this.startPosition = properties.startPosition;
    this.endColor = properties.endColor;
    this.endPosition = properties.endPosition;
  }

  static fromSemaphore(semaphore: SemaphoreGradient): Gradient {
    return new Gradient({
      type: semaphore.type,
      startColor: Color.fromSemaphore(semaphore.startColor),
      startPosition: Point.fromSemaphore(semaphore.startPosition),
      endColor: Color.fromSemaphore(semaphore.endColor),
      endPosition: Point.fromSemaphore(semaphore.endPosition),
    });
  }

  static fromMSGradient(gradient: MSGradient): Gradient {
    return new Gradient({
      type: convertMSGradientType(gradient.gradientType()),
      startColor: Color.fromMSColor(gradient.stops().firstObject().color()),
      startPosition: Point.fromCGPoint(gradient.from()),
      endColor: Color.fromMSColor(gradient.stops().lastObject().color()),
      endPosition: Point.fromCGPoint(gradient.to()),
    });
  }

  toSemaphore(): SemaphoreGradient {
    return {
      type: this.type,
      startColor: this.startColor.toSemaphore(),
      startPosition: this.startPosition.toSemaphore(),
      endColor: this.endColor.toSemaphore(),
      endPosition: this.endPosition.toSemaphore(),
    };
  }

  toMSGradient(): MSGradient {
    const gradient =  MSGradient.alloc().init();
    gradient.setGradientType(convertSemaphoreGradientType(this.type));
    gradient.setColor_atIndex(this.startColor.toMSColor(), 0);
    gradient.setFrom(this.startPosition.toCGPoint());
    gradient.setColor_atIndex(this.endColor.toMSColor(), 1);
    gradient.setTo(this.endPosition.toCGPoint());
    return gradient;
  }
}

export default Gradient;
