export interface PageItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  status: string;
  featured_image: string;
}

export interface PagesResponse {
  success: boolean;
  data: PageItem[];
}

export interface PageResponse {
  success: boolean;
  data: PageItem;
}