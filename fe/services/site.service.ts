export interface SiteLogo {
  id: number;
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface SiteLogoResponse {
  success: boolean;
  data: SiteLogo;
}

export async function getSiteLogo(): Promise<SiteLogoResponse> {
  const response = await fetch("/api/site/logo");

  if (!response.ok) {
    throw new Error("Không thể lấy logo");
  }

  return response.json();
}