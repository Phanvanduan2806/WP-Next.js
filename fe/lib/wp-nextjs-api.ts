import { NextRequest, NextResponse } from "next/server";
import { WORDPRESS_API_URL, AUTH_COOKIE_NAME } from "@/lib/api";

export type WpAuthMode = "public" | "optional" | "required";

type WpNextjsApiOptions = {
  auth?: WpAuthMode;
  method?: string;
  body?: unknown;
  forwardQuery?: boolean;
  revalidate?: number;
  responseHeaders?: Record<string, string>;
};

export async function wpNextjsApi(
  request: NextRequest,
  endpoint: string,
  options: WpNextjsApiOptions = {},
): Promise<NextResponse> {
  const {
    auth = "required",
    method = request.method,
    forwardQuery = true,
    revalidate,
    responseHeaders = {},
  } = options;

  if (!WORDPRESS_API_URL) {
    return NextResponse.json(
      {
        success: false,
        message: "Chưa cấu hình WordPress API URL.",
      },
      { status: 500 },
    );
  }

  if (
    !endpoint.startsWith("/") ||
    endpoint.startsWith("//") ||
    endpoint.includes("://")
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "WordPress API endpoint không hợp lệ.",
      },
      { status: 400 },
    );
  }

  const token =
    auth === "public"
      ? undefined
      : request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (auth === "required" && !token) {
    return NextResponse.json(
      {
        success: false,
        code: "not_authenticated",
        message: "Vui lòng đăng nhập để tiếp tục.",
      },
      { status: 401 },
    );
  }

  const baseUrl = WORDPRESS_API_URL.replace(/\/+$/, "");
  const query = forwardQuery ? request.nextUrl.search : "";
  const url = `${baseUrl}${endpoint}${query}`;

  const headers = new Headers({
    Accept: "application/json",
  });

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let body: string | undefined;

  try {
    if (method !== "GET" && method !== "HEAD") {
      if (Object.prototype.hasOwnProperty.call(options, "body")) {
        if (options.body !== undefined) {
          body = JSON.stringify(options.body);
          headers.set("Content-Type", "application/json");
        }
      } else {
        body = await request.text();

        const contentType = request.headers.get("content-type");
        if (contentType && body) {
          headers.set("Content-Type", contentType);
        }
      }
    }

    const fetchOptions: RequestInit & {
      next?: { revalidate: number };
    } = {
      method,
      headers,
      body,
    };

    if (typeof revalidate === "number") {
      fetchOptions.next = { revalidate };
    } else {
      fetchOptions.cache = "no-store";
    }

    const response = await fetch(url, fetchOptions);
    const responseBody = await response.text();

    const responseHeadersResult = new Headers(responseHeaders);
    const contentType = response.headers.get("content-type");

    if (contentType) {
      responseHeadersResult.set("Content-Type", contentType);
    }

    return new NextResponse(responseBody || null, {
      status: response.status,
      headers: responseHeadersResult,
    });
  } catch (error) {
    console.error("[WP Next.js API] Request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể kết nối đến WordPress API.",
      },
      {
        status: 502,
        headers: responseHeaders,
      },
    );
  }
}