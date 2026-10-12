import type {
  PostResponse,
  PostsResponse,
} from "@/services/types/post";

/**
 * Lấy danh sách bài viết
 *
 * Client → Next.js API → WordPress
 */
export async function getPosts(
  page = 1,
  perPage = 10,
  category?: string,
): Promise<PostsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  if (category) {
    params.set("category", category);
  }

  const response = await fetch(
    `/api/posts?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(
      "Không thể lấy danh sách bài viết",
    );
  }

  return response.json();
}

/**
 * Lấy chi tiết bài viết
 *
 * Client → Next.js API → WordPress
 */
export async function getPost(
  slug: string,
): Promise<PostResponse> {
  const response = await fetch(
    `/api/posts/${encodeURIComponent(slug)}`,
  );

  if (!response.ok) {
    throw new Error(
      "Không thể lấy bài viết",
    );
  }

  return response.json();
}