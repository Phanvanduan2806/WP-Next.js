import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SWRProvider from "@/components/providers/SWRProvider";

import { WORDPRESS_API_URL } from "@/lib/api";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

async function getSite() {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/site`,
      {
        next: {
          revalidate: 60,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    return result?.data ?? null;
  } catch (error) {
    console.error("SITE ERROR:", error);

    return null;
  }
}

async function getSiteIcon() {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/site/icon`,
      {
        next: {
          revalidate: 60,
        },
      },
    );

    if (!response.ok) {
      return "";
    }

    const result = await response.json();

    return result?.data?.url || "";
  } catch (error) {
    console.error("SITE ICON ERROR:", error);

    return "";
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const [site, icon] = await Promise.all([
    getSite(),
    getSiteIcon(),
  ]);

  return {
    title: site?.title || "ReactWP",

    description:
      site?.description ||
      "Headless WordPress with Next.js",

    icons: icon
      ? {
          icon,
        }
      : undefined,
  };
}

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <SWRProvider>
          <Header />

          <main className="flex-1">
            {children}
          </main>

          <Footer />
        </SWRProvider>
      </body>
    </html>
  );
}