import type {
  PageResponse,
  PagesResponse,
} from "@/services/types/page";

export async function getPages(): Promise<PagesResponse> {
  const baseUrl = process.env.WORDPRESS_API_URL;

  if (!baseUrl) {
    throw new Error(
      "WORDPRESS_API_URL chưa được cấu hình",
    );
  }

  const response = await fetch(
    `${baseUrl}/pages`,
    {
      next: {
        revalidate: 60,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Không thể lấy danh sách trang: ${response.status}`,
    );
  }

  return response.json();
}

export async function getPage(
  slug: string,
): Promise<PageResponse> {
  const baseUrl = process.env.WORDPRESS_API_URL;

  if (!baseUrl) {
    throw new Error(
      "WORDPRESS_API_URL chưa được cấu hình",
    );
  }

  const response = await fetch(
    `${baseUrl}/pages/${encodeURIComponent(slug)}`,
    {
      next: {
        revalidate: 60,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Không thể lấy trang: ${response.status}`,
    );
  }

  return response.json();
}