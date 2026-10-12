"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { useCart } from "@/hooks/useCart";
import { useCartAnimation } from "@/hooks/useCartAnimation";

export default function CartIcon() {
  const { totalItems, refreshCart } = useCart();
  const { flyingItems, removeFlyingItem } = useCartAnimation();

  const [bump, setBump] = useState(false);
  const [revision, setRevision] = useState(0);

  const triggerBump = useCallback(() => {
    setRevision((value) => value + 1);
    setBump(true);
  }, []);

  useEffect(() => {
    if (!bump) return;

    const timeout = window.setTimeout(() => setBump(false), 400);

    return () => window.clearTimeout(timeout);
  }, [bump, revision]);

  useEffect(() => {
    const handleUpdated = () => {
      void refreshCart();
    };

    window.addEventListener("cart:updated", handleUpdated);

    return () => {
      window.removeEventListener("cart:updated", handleUpdated);
    };
  }, [refreshCart]);

  const finishAnimation = useCallback(
    (id: number) => {
      removeFlyingItem(id);
      triggerBump();
      void refreshCart();
    },
    [removeFlyingItem, refreshCart, triggerBump],
  );

  return (
    <>
      {/* Product fly animation */}

      {/* Product fly animation */}
      <div className="pointer-events-none fixed inset-0 z-[9999] overflow-visible">
        <AnimatePresence>
          {flyingItems.map((item) => {
            const size = Math.min(item.startWidth, item.startHeight) * 0.7;

            // Giữ ảnh vuông và căn giữa vị trí ảnh sản phẩm ban đầu
            const startX = item.startX + (item.startWidth - size) / 2;
            const startY = item.startY + (item.startHeight - size) / 2;

            return (
              <motion.img
                key={item.id}
                src={item.imageSrc}
                alt=""
                aria-hidden="true"
                draggable={false}
                initial={{
                  position: "fixed",
                  left: startX,
                  top: startY,
                  width: size,
                  height: size,
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                  borderRadius: 12,
                }}
                animate={{
                  left: item.endX - size / 2,
                  top: item.endY - size / 2,
                  width: size,
                  height: size,
                  opacity: 0.3,
                  scale: 0.2,
                  rotate: 8,
                  borderRadius: 12,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: item.duration / 1000,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
                onAnimationComplete={() => finishAnimation(item.id)}
                className="rounded-xl border border-black/5 bg-white p-1 object-contain shadow-lg"
                style={{ transformOrigin: "center center" }}
              />
            );
          })}
        </AnimatePresence>
      </div>

      <Link
        href="/cart"
        data-cart-icon=""
        aria-label={`Giỏ hàng, ${totalItems} sản phẩm`}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-accent"
      >
        <motion.span
          key={revision}
          initial={{ scale: 1 }}
          animate={bump ? { scale: [1, 1.25, 0.9, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 0.38 }}
          className="inline-flex"
        >
          <ShoppingCart className="h-5 w-5" />
        </motion.span>

        <AnimatePresence mode="popLayout">
          {totalItems > 0 && (
            <motion.span
              key={totalItems}
              initial={{ scale: 0.4, opacity: 0, y: 4 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: -4 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 24,
              }}
              className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground"
            >
              {totalItems > 99 ? "99+" : totalItems}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </>
  );
}
