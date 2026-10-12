import { NextRequest } from "next/server";
import { wpNextjsApi } from "@/lib/wp-nextjs-api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteContext,
) {
  const { slug } = await params;

  return wpNextjsApi(
    request,
    `/products/${encodeURIComponent(slug)}`,
    {
      auth: "public",
      forwardQuery: false,
      responseHeaders: NO_CACHE_HEADERS,
    },
  );
}