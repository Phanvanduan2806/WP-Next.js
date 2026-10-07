export interface PageItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  status: string;
  parent: number;
  order: number;
}

export interface PageResponse {
  success: boolean;
  data: PageItem;
}

export async function getPage(
  slug: string,
): Promise<PageResponse> {
  const response = await fetch(
    `/api/pages/${slug}`,
  );

  if (!response.ok) {
    throw new Error("Không thể lấy page");
  }

  return response.json();
}