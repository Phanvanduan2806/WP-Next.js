export interface CategoryImage {
  id: number;
  url: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  content: string;
  count: number;
  parent: number;
  image: CategoryImage;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

export interface CategoryResponse {
  success: boolean;
  data: Category;
}

/**
 * Client
 */
export async function getCategories(): Promise<CategoriesResponse> {
  const response = await fetch("/api/category");

  if (!response.ok) {
    throw new Error("Không thể lấy categories");
  }

  return response.json();
}

/**
 * Client
 */
export async function getCategory(
  slug: string,
): Promise<CategoryResponse> {
  const response = await fetch(
    `/api/category/${encodeURIComponent(slug)}`,
  );

  if (!response.ok) {
    throw new Error("Không thể lấy category");
  }

  return response.json();
}

/**
 * Server
 */
export async function getCategoryServer(
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
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Không thể lấy category: ${response.status}`,
    );
  }

  return response.json();
}