import { NextResponse } from "next/server";
import { WORDPRESS_API_URL } from "@/lib/api";

export async function GET() {
  try {
    const res = await fetch(`${WORDPRESS_API_URL}/menu`, {
      next: {
        revalidate: 60,
      },
    });

    return NextResponse.json(await res.json(), {
      status: res.status,
    });
  } catch (error) {
    console.error("MENU ERROR:", error);

    return NextResponse.json({ message: "Server lỗi" }, { status: 500 });
  }
}
