
import { NextRequest, NextResponse } from "next/server";
import {
  WORDPRESS_API_URL,
  AUTH_COOKIE_NAME,
} from "@/lib/api";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!WORDPRESS_API_URL) {
    return NextResponse.json(
      {
        success: false,
        message: "Chưa cấu hình WORDPRESS_API_URL.",
      },
      { status: 500 }
    );
  }

  let body: {
    username?: string;
    email?: string;
    password?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Dữ liệu JSON không hợp lệ.",
      },
      { status: 400 }
    );
  }

  const username = body.username?.trim() || body.email?.trim();
  const password = body.password;

  if (!username || typeof password !== "string" || !password) {
    return NextResponse.json(
      {
        success: false,
        message: "Vui lòng nhập tài khoản/email và mật khẩu.",
      },
      { status: 400 }
    );
  }

  try {
    const wpResponse = await fetch(
      `${WORDPRESS_API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ username, password }),
        cache: "no-store",
      }
    );

    const data = await wpResponse.json().catch(() => null);

    if (
      !wpResponse.ok ||
      data?.success !== true ||
      typeof data?.token !== "string" ||
      !data.token
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            data?.message ||
            "Tên đăng nhập hoặc mật khẩu không chính xác.",
          code: data?.code,
        },
        {
          status:
            wpResponse.status >= 400
              ? wpResponse.status
              : 401,
        }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: data.user,
      expires_in: data.expires_in,
    });

    const expiresIn = Number(data.expires_in);

    const maxAge =
      Number.isFinite(expiresIn) && expiresIn > 0
        ? Math.floor(expiresIn)
        : 604800;

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    console.error("[auth/login] WordPress API request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể kết nối máy chủ xác thực.",
      },
      { status: 502 }
    );
  }
}