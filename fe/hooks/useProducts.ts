
"use client";

import { useCallback, useEffect, useState } from "react";
import { productService } from "@/services/client/product.service";

import type {
  Product,
  ProductDetail,
  ProductPagination,
  ProductVariation,
} from "@/services/types/product";

interface UseProductsOptions {
  initialPage?: number;
  perPage?: number;
  search?: string;
}

interface UseProductDetailResult {
  product: ProductDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const initialPagination: ProductPagination = {
  page: 1,
  per_page: 12,
  total: 0,
  total_pages: 0,
};

/**
 * Hook danh sách sản phẩm.
 */
export function useProducts({
  initialPage = 1,
  perPage = 12,
  search = "",
}: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);

  const [pagination, setPagination] = useState<ProductPagination>({
    ...initialPagination,
    page: initialPage,
    per_page: perPage,
  });

  const [page, setPage] = useState(initialPage);
  const [keyword, setKeyword] = useState(search);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await productService.getProducts({
        page,
        perPage,
        search: keyword,
      });

      setProducts(data.items);
      setPagination(data.pagination);
    } catch (err) {
      setProducts([]);

      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách sản phẩm.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, perPage, keyword]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const searchProducts = useCallback((value: string) => {
    setKeyword(value);
    setPage(1);
  }, []);

  return {
    products,
    pagination,
    page,
    setPage,
    keyword,
    searchProducts,
    loading,
    error,
    refetch: fetchProducts,
  };
}

/**
 * Hook chi tiết sản phẩm.
 *
 * Hỗ trợ ProductDetail có:
 * - Thông tin sản phẩm.
 * - Thuộc tính.
 * - Danh sách biến thể WooCommerce.
 */
export function useProductDetail(
  slug: string,
): UseProductDetailResult {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    const normalizedSlug = slug.trim();

    if (!normalizedSlug) {
      setProduct(null);
      setError("Slug sản phẩm không hợp lệ.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response =
        await productService.getProductBySlug(normalizedSlug);

      setProduct(response.item);
    } catch (err) {
      setProduct(null);

      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải chi tiết sản phẩm.",
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
  };
}

/**
 * Tìm biến thể khớp với các thuộc tính đã chọn.
 */
export function findMatchingVariation(
  product: ProductDetail,
  selectedAttributes: Record<string, string>,
): ProductVariation | undefined {
  const selectedEntries = Object.entries(selectedAttributes);

  if (selectedEntries.length === 0) {
    return undefined;
  }

  return product.variations.find((variation) =>
    selectedEntries.every(
      ([key, value]) => variation.attributes[key] === value,
    ),
  );
}
