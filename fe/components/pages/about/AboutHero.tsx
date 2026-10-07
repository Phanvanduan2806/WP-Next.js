export default function AboutHero() {
  return (
    <section>
      <div className="container mx-auto px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-primary">
            Giới thiệu
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Về chúng tôi
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Chúng tôi xây dựng những website hiện đại với
            WordPress và Next.js, tập trung vào hiệu năng,
            khả năng mở rộng và trải nghiệm người dùng.
          </p>
        </div>
      </div>
    </section>
  );
}