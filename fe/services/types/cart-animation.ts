export interface CartAnimationDetail {
  image: HTMLImageElement;
  sourceRect?: DOMRect;
  duration?: number;
}

export interface FlyingItem {
  id: number;
  imageSrc: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  endX: number;
  endY: number;
  endWidth: number;
  endHeight: number;
  duration: number;
}