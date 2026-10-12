"use client";

import { useRef, useState } from "react";
import type { RefObject } from "react";
import { LoaderCircle, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import {
  CART_ANIMATION_EVENT,
  CART_UPDATED_EVENT,
} from "@/lib/cart-events";

interface ProductAddToCartButtonProps {
  productId: number;
  productName: string;
  quantity: number;
  imageRef: RefObject<HTMLImageElement | null>;
  disabled?: boolean;
  variationId?: number;
  variation?: Record<string, string>;
  isVariable?: boolean;
}

export default function ProductAddToCartButton({
  productId,
  productName,
  quantity,
  imageRef,
  disabled = false,
  variationId,
  variation,
  isVariable = false,
}: ProductAddToCartButtonProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const requestLock = useRef(false);

  const needsVariation = isVariable && !variationId;

  const handleAddToCart = async () => {
    if (
      requestLock.current ||
      disabled ||
      needsVariation
    ) {
      return;
    }

    requestLock.current = true;
    setIsAdding(true);

    const image = imageRef.current;
    const sourceRect = image?.getBoundingClientRect();

    try {
      await addItem({
        product_id: productId,
        quantity,
        ...(variationId
          ? {
              variation_id: variationId,
              variation: variation ?? {},
            }
          : {}),
      });

      if (image?.isConnected && sourceRect) {
        window.dispatchEvent(
          new CustomEvent(CART_ANIMATION_EVENT, {
            detail: {
              image,
              sourceRect,
              duration: 650,
            },
          }),
        );
      }

      window.dispatchEvent(
        new CustomEvent(CART_UPDATED_EVENT),
      );
    } catch (error) {
      console.error(
        `Không thể thêm ${productName} vào giỏ hàng:`,
        error,
      );
    } finally {
      requestLock.current = false;
      setIsAdding(false);
    }
  };

  return (
    <Button
      type="button"
      className="h-12 w-full rounded-xl"
      onClick={handleAddToCart}
      disabled={
        disabled ||
        isAdding ||
        needsVariation
      }
    >
      {isAdding ? (
        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <ShoppingCart className="mr-2 h-5 w-5" />
      )}

      {isAdding
        ? "Đang thêm..."
        : needsVariation
          ? "Chọn phiên bản"
          : "Thêm vào giỏ hàng"}
    </Button>
  );
}