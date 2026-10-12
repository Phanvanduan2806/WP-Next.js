import type {
  CategoryResponse,
  CategoriesResponse,
} from "../types/category";

/**
 * Lấy danh sách chuyên mục
 *
 * Client → Next.js API → WordPress
 */
export async function getCategories(): Promise<CategoriesResponse> {
  const response = await fetch(
    "/api/category",
  );

  if (!response.ok) {
    throw new Error(
      "Không thể lấy danh sách chuyên mục",
    );
  }

  return response.json();
}

/**
 * Lấy chi tiết chuyên mục
 *
 * Client → Next.js API → WordPress
 */
export async function getCategory(
  slug: string,
): Promise<CategoryResponse> {
  const response = await fetch(
    `/api/category/${encodeURIComponent(slug)}`,
  );

  if (!response.ok) {
    throw new Error(
      "Không thể lấy chuyên mục",
    );
  }

  return response.json();
}