// @flow

class Point {
  x: number;
  y: number;

  constructor(properties: { x: number, y: number }) {
    this.x = properties.x;
    this.y = properties.y;
  }

  static fromSemaphore(semaphore: SemaphorePoint): Point {
    return new Point(semaphore);
  }

  static fromCGPoint(point: CGPoint): Point {
    return new Point({
      x: Number(point.x),
      y: Number(point.y),
    });
  }

  toSemaphore(): SemaphorePoint {
    return {
      x: this.x,
      y: this.y,
    };
  }

  toCGPoint(): CGPoint {
    return CGPointMake(this.x, this.y);
  }
}

export default Point;
