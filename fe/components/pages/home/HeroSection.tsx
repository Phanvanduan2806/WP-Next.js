import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="border-b">
      <div className="container mx-auto px-4 py-24 md:px-6 md:py-32">
        <div className="mx-auto max-w-3xl text-center">

          <p className="mb-4 text-sm font-medium text-primary">
            Headless WordPress
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            WordPress làm CMS.
            <br />
            Next.js làm Frontend.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Xây dựng website hiện đại với WordPress quản lý
            nội dung và Next.js mang đến trải nghiệm frontend
            nhanh, linh hoạt và tối ưu.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/posts"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Xem bài viết
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}