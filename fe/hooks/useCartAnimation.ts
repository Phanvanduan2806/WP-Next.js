"use client";

import { useCallback, useEffect, useState } from "react";

import { CART_ANIMATION_EVENT } from "@/lib/cart-events";
import type {
  CartAnimationDetail,
  FlyingItem,
} from "@/services/types/cart-animation";

export function useCartAnimation() {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

  const removeFlyingItem = useCallback((id: number) => {
    setFlyingItems((items) => items.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    const handleAnimation = (event: Event) => {
      const customEvent =
        event as CustomEvent<CartAnimationDetail>;

      const { image, sourceRect, duration = 650 } =
        customEvent.detail ?? {};

      if (!image?.isConnected) return;

      const cartTarget =
        document.querySelector<HTMLElement>("[data-cart-icon]");

      if (!cartTarget) return;

      const start = sourceRect ?? image.getBoundingClientRect();
      const end = cartTarget.getBoundingClientRect();

      if (
        start.width <= 0 ||
        start.height <= 0 ||
        end.width <= 0 ||
        end.height <= 0
      ) {
        return;
      }

      const item: FlyingItem = {
        id: Date.now() + Math.random(),
        imageSrc: image.currentSrc || image.src,
        startX: start.left,
        startY: start.top,
        startWidth: start.width,
        startHeight: start.height,
        endX: end.left + end.width / 2,
        endY: end.top + end.height / 2,
        endWidth: end.width,
        endHeight: end.height,
        duration,
      };

      setFlyingItems((items) => [...items, item]);
    };

    window.addEventListener(CART_ANIMATION_EVENT, handleAnimation);

    return () => {
      window.removeEventListener(
        CART_ANIMATION_EVENT,
        handleAnimation,
      );
    };
  }, []);

  return {
    flyingItems,
    removeFlyingItem,
  };
}