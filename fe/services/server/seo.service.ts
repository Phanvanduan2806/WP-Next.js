import type { Metadata } from "next";
import { headers } from "next/headers";
import { cache } from "react";

import type { SeoResponse } from "@/services/types/seo";

async function getFrontendOrigin() {
  const headersList = await headers();

  const host =
    headersList.get("x-forwarded-host") ??
    headersList.get("host");

  const protocol =
    headersList.get("x-forwarded-proto") ??
    "http";

  if (!host) {
    throw new Error(
      "Không thể xác định domain frontend",
    );
  }

  return `${protocol}://${host}`;
}

function toFrontendUrl(
  url: string | null,
  origin: string,
): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    const parsed = new URL(url);

    return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return url;
  }
}

export const getSeo = cache(
  async (
    path: string,
  ): Promise<SeoResponse> => {
    const baseUrl =
      process.env.WORDPRESS_API_URL;

    if (!baseUrl) {
      throw new Error(
        "WORDPRESS_API_URL chưa được cấu hình",
      );
    }

    const params = new URLSearchParams({
      url: path,
    });

    const response = await fetch(
      `${baseUrl}/seo?${params.toString()}`,
      {
        next: {
          revalidate: 60,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Không thể lấy SEO: ${response.status}`,
      );
    }

    return response.json();
  },
);

export async function seoToMetadata(
  response: SeoResponse,
): Promise<Metadata> {
  if (
    !response.success ||
    !response.data
  ) {
    return {};
  }

  const seo = response.data;
  const origin = await getFrontendOrigin();

  return {
    title: seo.title ?? undefined,

    description:
      seo.description ?? undefined,

    robots:
      seo.robots ?? undefined,

    alternates: {
      canonical: toFrontendUrl(
        seo.canonical,
        origin,
      ),
    },

    openGraph: {
      locale:
        seo.openGraph.locale ?? undefined,

      type:
        seo.openGraph.type === "article"
          ? "article"
          : "website",

      title:
        seo.openGraph.title ?? undefined,

      description:
        seo.openGraph.description ??
        undefined,

      url: toFrontendUrl(
        seo.openGraph.url,
        origin,
      ),

      siteName:
        seo.openGraph.siteName ??
        undefined,

      images: seo.openGraph.image
        ? [
            {
              url: seo.openGraph.image,
            },
          ]
        : undefined,

      publishedTime:
        seo.openGraph.publishedTime ??
        undefined,

      modifiedTime:
        seo.openGraph.modifiedTime ??
        undefined,
    },

    twitter: {
      card:
        seo.twitter.card === "summary"
          ? "summary"
          : "summary_large_image",

      title:
        seo.twitter.title ?? undefined,

      description:
        seo.twitter.description ??
        undefined,

      images: seo.twitter.image
        ? [seo.twitter.image]
        : undefined,
    },
  };
}

/**
 * SEO metadata dùng chung cho mọi route.
 *
 * path:
 *   /chinh-sach/
 *   /gioi-thieu/
 *   /posts/bai-viet/
 *   /category/tin-tuc/
 */
export async function generateSeoMetadata(
  path: string,
): Promise<Metadata> {
  try {
    const response = await getSeo(path);

    return seoToMetadata(response);
  } catch {
    return {};
  }
}