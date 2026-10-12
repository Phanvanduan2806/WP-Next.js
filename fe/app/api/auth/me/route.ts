
import { NextRequest, NextResponse } from "next/server";
import {
  WORDPRESS_API_URL,
  AUTH_COOKIE_NAME,
} from "@/lib/api";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        user: null,
      },
      { status: 401 }
    );
  }

  if (!WORDPRESS_API_URL) {
    return NextResponse.json(
      {
        success: false,
        message: "Chưa cấu hình WORDPRESS_API_URL.",
      },
      { status: 500 }
    );
  }

  try {
    const wpResponse = await fetch(
      `${WORDPRESS_API_URL}/auth/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await wpResponse.json().catch(() => null);

    if (
      !wpResponse.ok ||
      data?.success !== true ||
      !data?.user
    ) {
      const response = NextResponse.json(
        {
          success: false,
          authenticated: false,
          user: null,
        },
        { status: 401 }
      );

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

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: data.user,
    });
  } catch (error) {
    console.error("[auth/me] WordPress API request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể xác minh phiên đăng nhập.",
      },
      { status: 502 }
    );
  }
}