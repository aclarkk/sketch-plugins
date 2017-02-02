// @flow

type SemaphoreGradientType = 'linear' | 'radial';

type SemaphoreGradient = {
  type: SemaphoreGradientType;
  startColor: SemaphoreColor;
  startPosition: SemaphorePoint;
  endColor: SemaphoreColor;
  endPosition: SemaphorePoint;
}
