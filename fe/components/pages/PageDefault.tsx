import Breadcrumb from "../layout/Breadcrumb";
import Container from "../layout/Container";

import type { PageItem } from "@/services/types/page";

interface PageContentProps {
  page: PageItem;
}

export default function PageDefault({
  page,
}: PageContentProps) {
  return (
    <Container>
      <header className="border-b">
        <div className="mx-auto py-10">
          <Breadcrumb />

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
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
    </Container>
  );
}