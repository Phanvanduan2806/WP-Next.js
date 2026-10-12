"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
}

export default function QuantitySelector({
  quantity,
  onChange,
  disabled = false,
  min = 1,
  max = Number.MAX_SAFE_INTEGER,
}: QuantitySelectorProps) {
  const decrease = () => {
    onChange(Math.max(min, quantity - 1));
  };

  const increase = () => {
    onChange(Math.min(max, quantity + 1));
  };

  return (
    <div className="inline-flex h-12 items-center rounded-xl border">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Giảm số lượng"
        disabled={disabled || quantity <= min}
        onClick={decrease}
        className="h-10 w-10 rounded-lg"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <span
        aria-live="polite"
        className="min-w-10 text-center text-sm font-semibold tabular-nums"
      >
        {quantity}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Tăng số lượng"
        disabled={disabled || quantity >= max}
        onClick={increase}
        className="h-10 w-10 rounded-lg"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}