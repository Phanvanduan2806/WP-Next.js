"use client";

import { useState, type RefObject } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  imageRef: RefObject<HTMLImageElement | null>;
}

export default function ProductGallery({
  images,
  productName,
  imageRef,
}: ProductGalleryProps) {
  const validImages = images.filter(
    (image): image is string =>
      typeof image === "string" && image.trim().length > 0,
  );

  const [activeIndex, setActiveIndex] = useState(0);

  const currentIndex =
    activeIndex < validImages.length ? activeIndex : 0;

  const activeImage = validImages[currentIndex];

  const goToPrevious = () => {
    if (validImages.length <= 1) return;

    setActiveIndex((current) =>
      current === 0 ? validImages.length - 1 : current - 1,
    );
  };

  const goToNext = () => {
    if (validImages.length <= 1) return;

    setActiveIndex((current) =>
      current === validImages.length - 1 ? 0 : current + 1,
    );
  };

  if (!activeImage) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-gray-100 text-sm text-gray-500">
        Chưa có hình ảnh sản phẩm
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      {/* Ảnh sản phẩm chính */}
      <div className="group relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
        <img
          ref={imageRef}
          src={activeImage}
          alt={productName}
          className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              aria-label="Xem ảnh trước"
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-sm transition hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={goToNext}
              aria-label="Xem ảnh tiếp theo"
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-sm transition hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
              {currentIndex + 1}/{validImages.length}
            </div>
          </>
        )}
      </div>

      {/* Ảnh thu nhỏ */}
      {validImages.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {validImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Xem ảnh ${index + 1} của ${productName}`}
              aria-pressed={currentIndex === index}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-gray-50 transition ${
                currentIndex === index
                  ? "border-black"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <img
                src={image}
                alt={`${productName} - ảnh ${index + 1}`}
                loading="lazy"
                className="h-full w-full object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
