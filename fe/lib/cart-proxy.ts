import { NextRequest, NextResponse } from "next/server";
import { WORDPRESS_API_URL } from "@/lib/api";

const WC_SESSION_PREFIX = "wp_woocommerce_session_";

const WC_COOKIE_NAMES = new Set([
  "woocommerce_items_in_cart",
  "woocommerce_cart_hash",
]);

function getWooCommerceCookies(request: NextRequest): string {
  return request.cookies
    .getAll()
    .filter(
      ({ name }) =>
        name.startsWith(WC_SESSION_PREFIX) || WC_COOKIE_NAMES.has(name),
    )
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
}

function normalizeSetCookie(cookie: string): string {
  return cookie
    .replace(/;\s*Domain=[^;]*/gi, "")
    .replace(/;\s*Path=[^;]*/gi, "; Path=/");
}

export async function proxyCartRequest(
  request: NextRequest,
  endpoint: string,
  method: string,
): Promise<NextResponse> {
  const baseUrl = WORDPRESS_API_URL.replace(/\/+$/, "");
  const url = `${baseUrl}${endpoint}`;

  const headers = new Headers({
    Accept: "application/json",
  });

  const cookieHeader = getWooCommerceCookies(request);

  if (cookieHeader) {
    headers.set("Cookie", cookieHeader);
  }

  const contentType = request.headers.get("content-type");

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  let body: string | undefined;

  if (method !== "GET" && method !== "HEAD" && method !== "DELETE") {
    body = await request.text();
  }

  const upstream = await fetch(url, {
    method,
    headers,
    body,
    cache: "no-store",
    redirect: "manual",
  });

  const response = new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  });

  const getSetCookie = (
    upstream.headers as Headers & {
      getSetCookie?: () => string[];
    }
  ).getSetCookie;

  const setCookies =
    typeof getSetCookie === "function"
      ? getSetCookie.call(upstream.headers)
      : upstream.headers.get("set-cookie")
        ? [upstream.headers.get("set-cookie")!]
        : [];

  for (const cookie of setCookies) {
    const normalized = normalizeSetCookie(cookie);

    if (
      normalized.includes(WC_SESSION_PREFIX) ||
      [...WC_COOKIE_NAMES].some((name) => normalized.startsWith(`${name}=`))
    ) {
      response.headers.append("Set-Cookie", normalized);
    }
  }

  return response;
}
