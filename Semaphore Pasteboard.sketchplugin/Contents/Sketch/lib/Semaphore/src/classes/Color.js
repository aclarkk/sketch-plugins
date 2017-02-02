// @flow

class Color {
  r: number;
  g: number;
  b: number;
  a: number;

  constructor(properties: { r: number, g: number, b: number, a: number }) {
    this.r = properties.r;
    this.g = properties.g;
    this.b = properties.b;
    this.a = properties.a;
  }

  static fromSemaphore(semaphore: SemaphoreColor): Color {
    return new Color(semaphore);
  }

  static fromMSColor(color: MSColor): Color {
    return new Color({
      r: Number(color.red()),
      g: Number(color.green()),
      b: Number(color.blue()),
      a: Number(color.alpha()),
    });
  }

  toSemaphore(): SemaphoreColor {
    return {
      r: this.r,
      g: this.g,
      b: this.b,
      a: this.a,
    };
  }

  toMSColor(): MSColor {
    return MSColor.colorWithRed_green_blue_alpha(
      this.r,
      this.g,
      this.b,
      this.a
    );
  }
}

export default Color;
