"use client";

import { useRef } from "react";
import Link from "next/link";

import { useProducts } from "@/hooks/useProducts";
import ProductAddToCartButton from "@/components/products/ProductAddToCartButton";

type ProductListItem = ReturnType<typeof useProducts>["products"][number];

function formatPrice(price: string, currency: string) {
  const amount = Number(price);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Liên hệ";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ProductCard({ product }: { product: ProductListItem }) {
  const imageRef = useRef<HTMLImageElement>(null);

  const isOutOfStock = !product.in_stock || !product.purchasable;

  const hasRegularPrice =
    Boolean(product.regular_price) &&
    Number(product.regular_price) > Number(product.price);

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-md">
      <Link
        href={`/shop/${product.slug}`}
        className="flex flex-1 flex-col"
        aria-label={`Xem chi tiết ${product.name}`}
      >
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {product.image ? (
            <img
              ref={imageRef}
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              Chưa có hình ảnh
            </div>
          )}

          {isOutOfStock && (
            <span className="absolute left-2 top-2 rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white">
              Hết hàng
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <h2 className="line-clamp-2 text-sm font-medium text-gray-900 transition group-hover:text-gray-600 sm:text-base">
            {product.name}
          </h2>

          <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-base font-bold text-red-600">
              {formatPrice(product.price, product.currency)}
            </span>

            {hasRegularPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.regular_price, product.currency)}
              </span>
            )}
          </div>

          <span className="mt-3 text-sm font-medium text-gray-700">
            Xem chi tiết →
          </span>
        </div>
      </Link>

      {/* Nút nằm ngoài Link để tránh lồng tương tác */}
      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <ProductAddToCartButton
          productId={product.id}
          productName={product.name}
          quantity={1}
          imageRef={imageRef}
          disabled={isOutOfStock}
        />
      </div>
    </article>
  );
}

export default function ProductList() {
  const {
    products,
    pagination,
    page,
    setPage,
    keyword,
    searchProducts,
    loading,
    error,
    refetch,
  } = useProducts({ perPage: 12 });

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-500">
            WooCommerce
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Sản phẩm
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            {pagination.total} sản phẩm
          </p>
        </div>

        <div className="w-full sm:max-w-sm">
          <label htmlFor="product-search" className="sr-only">
            Tìm kiếm sản phẩm
          </label>

          <input
            id="product-search"
            type="search"
            value={keyword}
            onChange={(event) => searchProducts(event.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={() => void refetch()}
            className="w-fit rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      )}

      {loading ? (
        <div
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          aria-label="Đang tải sản phẩm"
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse overflow-hidden rounded-xl border border-gray-200"
            >
              <div className="aspect-square bg-gray-100" />

              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 rounded bg-gray-100" />
                <div className="h-4 w-1/2 rounded bg-gray-100" />
                <div className="h-10 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : !error && products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 px-4 py-16 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Không tìm thấy sản phẩm
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Hãy thử tìm kiếm với từ khóa khác.
          </p>
        </div>
      ) : !error ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {pagination.total_pages > 1 && (
            <nav
              aria-label="Phân trang sản phẩm"
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trước
              </button>

              <span className="px-3 text-sm text-gray-600">
                Trang {pagination.page} / {pagination.total_pages}
              </span>

              <button
                type="button"
                disabled={page >= pagination.total_pages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Tiếp
              </button>
            </nav>
          )}
        </>
      ) : null}
    </section>
  );
}
