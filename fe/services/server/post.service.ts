import type {
  PostResponse,
  PostsResponse,
} from "@/services/types/post";

/**
 * Lấy danh sách bài viết
 *
 * Server → WordPress
 */
export async function getPosts(
  page = 1,
  perPage = 10,
  category?: string,
): Promise<PostsResponse> {
  const baseUrl = process.env.WORDPRESS_API_URL;

  if (!baseUrl) {
    throw new Error(
      "WORDPRESS_API_URL chưa được cấu hình",
    );
  }

  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  if (category) {
    params.set("category", category);
  }

  const response = await fetch(
    `${baseUrl}/posts?${params.toString()}`,
    {
      next: {
        revalidate: 60,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Không thể lấy danh sách bài viết: ${response.status}`,
    );
  }

  return response.json();
}

/**
 * Lấy chi tiết bài viết
 *
 * Server → WordPress
 */
export async function getPost(
  slug: string,
): Promise<PostResponse> {
  const baseUrl = process.env.WORDPRESS_API_URL;

  if (!baseUrl) {
    throw new Error(
      "WORDPRESS_API_URL chưa được cấu hình",
    );
  }

  const response = await fetch(
    `${baseUrl}/posts/${encodeURIComponent(slug)}`,
    {
      next: {
        revalidate: 60,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Không thể lấy bài viết: ${response.status}`,
    );
  }

  return response.json();
}