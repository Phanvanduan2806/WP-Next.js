import { NextRequest } from "next/server";
import { wpNextjsApi } from "@/lib/wp-nextjs-api";

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
    `/posts/${encodeURIComponent(slug)}`,
    {
      auth: "public",
      forwardQuery: false,
      revalidate: 60,
    },
  );
}