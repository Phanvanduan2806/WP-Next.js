"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";

import { useProductDetail } from "@/hooks/useProducts";
import ProductGallery from "@/components/products/ProductGallery";
import QuantitySelector from "@/components/products/QuantitySelector";
import ProductAddToCartButton from "@/components/products/ProductAddToCartButton";
import Container from "../layout/Container";
import Breadcrumb from "../layout/Breadcrumb";

import type {
  ProductDetail as ProductDetailType,
  ProductVariation,
} from "@/services/types/product";

function formatPrice(
  value: string | number,
  currency = "VND",
) {
  const amount = Number(value);

  if (
    value === "" ||
    value === null ||
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    return "Liên hệ";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Chuyển tên thuộc tính thành slug để so sánh với
 * các lựa chọn mà WooCommerce trả về.
 *
 * Ví dụ:
 * "Màu cam" -> "mau-cam"
 * "128GB"   -> "128gb"
 */
function normalizeOption(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Tìm biến thể có đầy đủ thuộc tính trùng với
 * lựa chọn của người dùng.
 */
function findSelectedVariation(
  product: ProductDetailType,
  selectedAttributes: Record<string, string>,
): ProductVariation | undefined {
  const variationAttributes = product.attributes.filter(
    (attribute) => attribute.variation,
  );

  if (variationAttributes.length === 0) {
    return undefined;
  }

  const allSelected = variationAttributes.every((attribute) => {
    const key =
      attribute.key ?? `attribute_${attribute.slug}`;

    return Boolean(selectedAttributes[key]);
  });

  if (!allSelected) {
    return undefined;
  }

  return product.variations?.find((variation) =>
    variationAttributes.every((attribute) => {
      const key =
        attribute.key ?? `attribute_${attribute.slug}`;

      return (
        variation.attributes[key] ===
        selectedAttributes[key]
      );
    }),
  );
}

export default function ProductDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { product, loading, error } = useProductDetail(slug);

  const [quantity, setQuantity] = useState(1);

  const [selectedAttributes, setSelectedAttributes] =
    useState<Record<string, string>>({});

  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setQuantity(1);
    setSelectedAttributes({});
  }, [slug]);

  if (loading) {
    return (
      <Container>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
            Đang tải sản phẩm...
          </div>
        </div>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container>
        <main className="py-8 md:py-12">
          <Breadcrumb />

          <div className="py-12 text-center">
            <h1 className="text-2xl font-semibold">
              Không tìm thấy sản phẩm
            </h1>

            <p className="mt-3 text-muted-foreground">
              {error ||
                "Sản phẩm không tồn tại hoặc đã bị xóa."}
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Quay lại sản phẩm
            </Link>
          </div>
        </main>
      </Container>
    );
  }

  const images = product.images?.length
    ? product.images.filter(Boolean)
    : product.image
      ? [product.image]
      : [];

  const isVariable = product.type === "variable";

  const selectedVariation = isVariable
    ? findSelectedVariation(product, selectedAttributes)
    : undefined;

  /*
   * Với sản phẩm variable, chỉ sử dụng dữ liệu của
   * biến thể khi người dùng đã chọn đúng phiên bản.
   */
  const currentPrice = selectedVariation
    ? selectedVariation.price
    : product.price;

  const currentRegularPrice = selectedVariation
    ? selectedVariation.regular_price
    : product.regular_price;

  const currentSalePrice = selectedVariation
    ? selectedVariation.sale_price
    : product.sale_price;

  const price = Number(currentPrice);
  const regularPrice = Number(currentRegularPrice);
  const salePrice = Number(currentSalePrice);

  const hasSalePrice =
    currentSalePrice !== "" &&
    Number.isFinite(salePrice) &&
    salePrice > 0 &&
    Number.isFinite(regularPrice) &&
    regularPrice > salePrice;

  const displayPrice = hasSalePrice ? salePrice : price;

  const hasDiscount =
    Number.isFinite(regularPrice) &&
    Number.isFinite(displayPrice) &&
    regularPrice > displayPrice &&
    regularPrice > 0;

  const discountPercent = hasDiscount
    ? Math.round(
        ((regularPrice - displayPrice) / regularPrice) *
          100,
      )
    : 0;

  const currentInStock = selectedVariation
    ? selectedVariation.in_stock &&
      selectedVariation.purchasable
    : isVariable
      ? false
      : product.in_stock && product.purchasable;

  const currentStockQuantity = selectedVariation
    ? selectedVariation.stock_quantity
    : product.stock_quantity;

  const maxQuantity =
    typeof currentStockQuantity === "number"
      ? Math.max(0, currentStockQuantity)
      : Number.MAX_SAFE_INTEGER;

  const cannotAddToCart =
    !currentInStock ||
    maxQuantity < 1 ||
    (isVariable && !selectedVariation);

  const variationAttributes = product.attributes.filter(
    (attribute) => attribute.variation,
  );

  const hasSelectedAnyAttribute = Object.values(
    selectedAttributes,
  ).some(Boolean);

  return (
    <Container>
      <Breadcrumb />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          images={images}
          productName={product.name}
          imageRef={imageRef}
        />

        <section className="space-y-6">
          <div>
            {product.sku && (
              <p className="mb-2 text-sm text-muted-foreground">
                Mã sản phẩm: {product.sku}
              </p>
            )}

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {product.name}
            </h1>
          </div>

          {/*
           * Chọn thuộc tính biến thể
           */}
          {isVariable && (
            <div className="space-y-4 rounded-xl border p-4">
              <h2 className="font-semibold">
                Chọn phiên bản
              </h2>

              {variationAttributes.length === 0 ? (
                <p className="text-sm text-destructive">
                  Sản phẩm chưa có thuộc tính biến thể hợp lệ.
                </p>
              ) : (
                variationAttributes.map((attribute) => {
                  const key =
                    attribute.key ??
                    `attribute_${attribute.slug}`;

                  return (
                    <div key={key} className="space-y-2">
                      <label
                        htmlFor={key}
                        className="text-sm font-medium"
                      >
                        {attribute.name}
                      </label>

                      <select
                        id={key}
                        value={
                          selectedAttributes[key] ?? ""
                        }
                        onChange={(event) => {
                          const value = event.target.value;

                          setSelectedAttributes((previous) => ({
                            ...previous,
                            [key]: value,
                          }));

                          setQuantity(1);
                        }}
                        className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">
                          Chọn {attribute.name.toLowerCase()}
                        </option>

                        {attribute.options.map((option) => (
                          <option
                            key={option}
                            value={normalizeOption(option)}
                          >
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })
              )}

              {hasSelectedAnyAttribute &&
                !selectedVariation && (
                  <p
                    role="status"
                    className="text-sm text-destructive"
                  >
                    Tổ hợp phiên bản này chưa có sẵn hoặc
                    chưa được khai báo trong WooCommerce.
                  </p>
                )}

              {selectedVariation && (
                <p className="text-sm text-muted-foreground">
                  Mã biến thể: {selectedVariation.id}
                </p>
              )}
            </div>
          )}

          {/*
           * Giá sản phẩm hoặc giá biến thể
           */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-2xl font-bold text-primary">
              {isVariable && !selectedVariation
                ? "Chọn phiên bản để xem giá"
                : formatPrice(
                    displayPrice,
                    product.currency,
                  )}
            </span>

            {(!isVariable || selectedVariation) &&
              hasDiscount && (
                <>
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(
                      regularPrice,
                      product.currency,
                    )}
                  </span>

                  <span className="rounded-md bg-destructive/10 px-2 py-1 text-sm font-semibold text-destructive">
                    -{discountPercent}%
                  </span>
                </>
              )}
          </div>

          {/*
           * Tồn kho
           */}
          <div className="flex items-center gap-2 text-sm">
            {isVariable && !selectedVariation ? (
              <span className="text-muted-foreground">
                Vui lòng chọn đầy đủ phiên bản.
              </span>
            ) : cannotAddToCart ? (
              <span className="font-medium text-destructive">
                Hết hàng hoặc hiện không thể đặt mua
              </span>
            ) : (
              <>
                <Check
                  aria-hidden="true"
                  className="h-4 w-4 text-green-600"
                />
                <span className="text-green-700">
                  Còn hàng
                </span>
              </>
            )}
          </div>

          {/*
           * Mô tả ngắn
           */}
          {product.short_description && (
            <div
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: product.short_description,
              }}
            />
          )}

          {/*
           * Mô tả chi tiết
           */}
          {product.description && (
            <details className="group rounded-xl border p-4">
              <summary className="cursor-pointer font-semibold">
                Mô tả sản phẩm
              </summary>

              <div
                className="prose prose-sm mt-4 max-w-none"
                dangerouslySetInnerHTML={{
                  __html: product.description,
                }}
              />
            </details>
          )}

          {/*
           * Thông tin thuộc tính sản phẩm
           */}
          {product.attributes?.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold">
                Thông tin sản phẩm
              </h2>

              <dl className="divide-y rounded-xl border px-4">
                {product.attributes.map(
                  (attribute, index) => (
                    <div
                      key={`${attribute.name}-${index}`}
                      className="grid grid-cols-3 gap-4 py-3 text-sm"
                    >
                      <dt className="text-muted-foreground">
                        {attribute.name}
                      </dt>

                      <dd className="col-span-2">
                        {attribute.options?.join(", ") || "—"}
                      </dd>
                    </div>
                  ),
                )}
              </dl>
            </div>
          )}

          {/*
           * Số lượng và thêm giỏ hàng
           */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium">
                Số lượng
              </span>

              <QuantitySelector
                quantity={quantity}
                onChange={setQuantity}
                disabled={cannotAddToCart}
                max={maxQuantity}
              />
            </div>

            <ProductAddToCartButton
              productId={product.id}
              productName={product.name}
              quantity={quantity}
              imageRef={imageRef}
              disabled={cannotAddToCart}
              isVariable={isVariable}
              variationId={selectedVariation?.id}
              variation={selectedVariation?.attributes}
            />

            <Link
              href="/products"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Tiếp tục mua sắm
              <ArrowRight
                aria-hidden="true"
                className="ml-2 h-4 w-4"
              />
            </Link>
          </div>
        </section>
      </div>
    </Container>
  );
}