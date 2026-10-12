import type {
  GetProductsParams,
  ProductDetailResponse,
  ProductsResponse,
} from "@/services/types/product";

export const productService = {
  async getProducts({
    page = 1,
    perPage = 12,
    search = "",
  }: GetProductsParams = {}): Promise<ProductsResponse> {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    const response = await fetch(`/api/products?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Không thể tải danh sách sản phẩm.",
      );
    }

    if (!data.success || !Array.isArray(data.items)) {
      throw new Error("Dữ liệu danh sách sản phẩm không hợp lệ.");
    }

    return data as ProductsResponse;
  },

  async getProductBySlug(
    slug: string,
  ): Promise<ProductDetailResponse> {
    if (!slug.trim()) {
      throw new Error("Slug sản phẩm không hợp lệ.");
    }

    const response = await fetch(
      `/api/products/${encodeURIComponent(slug)}`,
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Không thể tải chi tiết sản phẩm.",
      );
    }

    if (!data.success || !data.item) {
      throw new Error("Dữ liệu chi tiết sản phẩm không hợp lệ.");
    }

    return data as ProductDetailResponse;
  },
};