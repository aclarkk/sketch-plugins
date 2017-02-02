// @flow

type MSGradientType = 0 | 1;

declare class MSGradient {
  static alloc(): MOAllocator<MSGradient>;
  setColor_atIndex(color: MSColor, index: number): void;
  setFrom(point: CGPoint): void;
  setTo(point: CGPoint): void;
  gradientType(): MSGradientType;
  setGradientType(type: MSGradientType): void;
  from(): CGPoint;
  to(): CGPoint;
  stops(): MSArray<MSGradientStop>;
}
