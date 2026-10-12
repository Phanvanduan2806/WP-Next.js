import { NextRequest } from "next/server";
import { wpNextjsApi } from "@/lib/wp-nextjs-api";

export async function GET(request: NextRequest) {
  return wpNextjsApi(request, "/menu", {
    auth: "public",
    forwardQuery: false,
    revalidate: 60,
  });
}