import { NextRequest } from "next/server";
import { wpNextjsApi } from "@/lib/wp-nextjs-api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

export async function GET(request: NextRequest) {
  return wpNextjsApi(request, "/products", {
    auth: "public",
    forwardQuery: true,
    responseHeaders: NO_CACHE_HEADERS,
  });
}