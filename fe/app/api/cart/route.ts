import { NextRequest } from "next/server";
import { wpNextjsApi } from "@/lib/wp-nextjs-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return wpNextjsApi(request, "/cart", {
    auth: "required",
    forwardQuery: false,
  });
}

export async function DELETE(request: NextRequest) {
  return wpNextjsApi(request, "/cart", {
    auth: "required",
    forwardQuery: false,
  });
}