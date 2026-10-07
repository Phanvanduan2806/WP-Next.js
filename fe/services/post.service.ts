export interface PostAuthor {
  id: number;
  name: string;
}

export interface PostCategory {
  id: number;
  name: string;
  slug: string;
}

export interface PostItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  status: string;
  author: PostAuthor;
  featured_image: string;
  categories: PostCategory[];
}

export interface PostPagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface PostsResponse {
  success: boolean;
  data: PostItem[];
  pagination: PostPagination;
}

export interface PostResponse {
  success: boolean;
  data: PostItem;
}

export async function getPosts(
  page = 1,
  perPage = 10,
): Promise<PostsResponse> {
  const response = await fetch(
    `/api/posts?page=${page}&per_page=${perPage}`,
  );

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách bài viết");
  }

  return response.json();
}

export async function getPost(
  slug: string,
): Promise<PostResponse> {
  const response = await fetch(
    `/api/posts/${slug}`,
  );

  if (!response.ok) {
    throw new Error("Không thể lấy bài viết");
  }

  return response.json();
}