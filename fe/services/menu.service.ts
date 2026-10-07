export interface MenuItem {
  id: number;
  title: string;
  url: string;
  parent: number;
  order: number;
}

export interface MenuResponse {
  success: boolean;
  data: MenuItem[];
}

export async function getMenu(): Promise<MenuResponse> {
  const response = await fetch("/api/menu");

  if (!response.ok) {
    throw new Error("Không thể lấy menu");
  }

  return response.json();
}