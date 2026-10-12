
import { NextRequest, NextResponse } from "next/server";
import {
  WORDPRESS_API_URL,
  AUTH_COOKIE_NAME,
} from "@/lib/api";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  let revoked = false;

  if (token && WORDPRESS_API_URL) {
    try {
      const wpResponse = await fetch(
        `${WORDPRESS_API_URL}/auth/logout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      revoked = wpResponse.ok;
    } catch (error) {
      console.error(
        "[auth/logout] WordPress API request failed:",
        error
      );
    }
  }

  const response = NextResponse.json({
    success: true,
    message: "Đã xóa cookie phiên đăng nhập.",
    token_revoked: revoked,
  });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}