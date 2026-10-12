export interface CategoryImage {
  id: number;
  url: string | null;
  alt?: string;
}

export interface CategoryItem {
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
  data: CategoryItem[];
}

export interface CategoryResponse {
  success: boolean;
  data: CategoryItem;
}