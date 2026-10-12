import type {
  PageResponse,
  PagesResponse,
} from "@/services/types/page";

export async function getPages(): Promise<PagesResponse> {
  const response = await fetch(
    "/api/pages",
  );

  if (!response.ok) {
    throw new Error(
      "Không thể lấy danh sách trang",
    );
  }

  return response.json();
}

export async function getPage(
  slug: string,
): Promise<PageResponse> {
  const response = await fetch(
    `/api/pages/${encodeURIComponent(slug)}`,
  );

  if (!response.ok) {
    throw new Error(
      "Không thể lấy trang",
    );
  }

  return response.json();
}