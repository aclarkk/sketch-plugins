// @flow

class Rect {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(properties: {
    x: number,
    y: number,
    width: number,
    height: number
  }) {
    this.x = properties.x;
    this.y = properties.y;
    this.width = properties.width;
    this.height = properties.height;
  }

  static fromSemaphore(semaphore: SemaphoreRect): Rect {
    return new Rect(semaphore);
  }

  static fromMSRect(rect: MSRect): Rect {
    return new Rect({
      x: Number(rect.x()),
      y: Number(rect.y()),
      width: Number(rect.width()),
      height: Number(rect.height()),
    });
  }

  toSemaphore(): SemaphoreRect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  toMSRect(): MSRect {
    return MSRect.rectWithX_y_width_height(
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

export default Rect;
