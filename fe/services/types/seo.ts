export interface SeoOpenGraph {
  locale: string | null;
  type: string | null;
  title: string | null;
  description: string | null;
  url: string | null;
  siteName: string | null;
  image: string | null;
  updatedTime: string | null;
  publishedTime: string | null;
  modifiedTime: string | null;
}

export interface SeoTwitter {
  card: string | null;
  title: string | null;
  description: string | null;
  image: string | null;
}

export interface SeoData {
  title: string | null;
  description: string | null;
  robots: string | null;
  canonical: string | null;

  openGraph: SeoOpenGraph;

  twitter: SeoTwitter;

  schema: unknown[];
}

export interface SeoResponse {
  success: boolean;
  data: SeoData;
}