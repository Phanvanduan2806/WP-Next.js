import { NextRequest } from "next/server";
import { wpNextjsApi } from "@/lib/wp-nextjs-api";

export async function GET(request: NextRequest) {
  return wpNextjsApi(request, "/posts", {
    auth: "public",
    forwardQuery: true,
    revalidate: 60,
  });
}