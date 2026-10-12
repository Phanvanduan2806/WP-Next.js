import type {
  CategoryResponse,
  CategoriesResponse,
} from "../types/category";

/**
 * Lấy danh sách chuyên mục
 *
 * Server → WordPress
 */
export async function getCategories(): Promise<CategoriesResponse> {
  const baseUrl = process.env.WORDPRESS_API_URL;

  if (!baseUrl) {
    throw new Error(
      "WORDPRESS_API_URL chưa được cấu hình",
    );
  }

  const response = await fetch(
    `${baseUrl}/category`,
    {
      next: {
        revalidate: 60,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Không thể lấy danh sách chuyên mục: ${response.status}`,
    );
  }

  return response.json();
}

/**
 * Lấy chi tiết chuyên mục
 *
 * Server → WordPress
 */
export async function getCategory(
  slug: string,
): Promise<CategoryResponse> {
  const baseUrl = process.env.WORDPRESS_API_URL;

  if (!baseUrl) {
    throw new Error(
      "WORDPRESS_API_URL chưa được cấu hình",
    );
  }

  const response = await fetch(
    `${baseUrl}/category/${encodeURIComponent(slug)}`,
    {
      next: {
        revalidate: 60,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Không thể lấy chuyên mục: ${response.status}`,
    );
  }

  return response.json();
}