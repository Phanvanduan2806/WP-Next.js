
export interface Product {
  id: number;
  name: string;
  slug: string;
  type: string;
  description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  currency: string;
  permalink: string;
  image: string | null;
  in_stock: boolean;
  purchasable: boolean;
  stock_status?: string;
}

export interface ProductAttribute {
  name: string;
  slug?: string;
  key?: string;
  options: string[];
  variation: boolean;
  visible?: boolean;
}

export interface ProductVariationAttributes {
  [key: string]: string;
}

export interface ProductVariation {
  id: number;
  sku: string;
  attributes: ProductVariationAttributes;
  price: string;
  regular_price: string;
  sale_price: string;
  currency: string;
  in_stock: boolean;
  stock_quantity: number | null;
  stock_status: string;
  manage_stock: boolean;
  purchasable: boolean;
  image: string | null;
  description: string;
}

export interface ProductDetail extends Product {
  short_description: string;
  images: string[];
  sku: string;
  stock_quantity: number | null;
  attributes: ProductAttribute[];
  variations: ProductVariation[];
}

export interface ProductPagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ProductsResponse {
  success: boolean;
  items: Product[];
  pagination: ProductPagination;
}

export interface ProductDetailResponse {
  success: boolean;
  item: ProductDetail;
}

export interface GetProductsParams {
  page?: number;
  perPage?: number;
  search?: string;
}
