"use client";

import { usePage } from "@/hooks/usePages";
import Breadcrumb from "../layout/Breadcrumb";

interface PageContentProps {
  slug: string;
}

export default function PageContent({ slug }: PageContentProps) {
  const { page, loading, error } = usePage(slug);

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20">
        <p className="text-destructive">{error}</p>
      </main>
    );
  }

  if (!page) {
    return (
      <main className="container mx-auto px-4 pt-6 md:px-6">
        <p className="text-muted-foreground">
          Không tìm thấy trang.
        </p>
      </main>
    );
  }

  return (
    <main>
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <Breadcrumb />

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            {page.title}
          </h1>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div
          className="prose prose-neutral max-w-none"
          dangerouslySetInnerHTML={{
            __html: page.content,
          }}
        />
      </section>
    </main>
  );
}