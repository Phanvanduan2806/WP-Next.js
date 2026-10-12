import Breadcrumb from "../layout/Breadcrumb";
import Container from "../layout/Container";

import type { PostItem } from "@/services/types/post";

import LatestPostsSection from "./LatestPostsSection";

interface PostDefaultProps {
  post: PostItem;
}

export default function PostDefault({
  post,
}: PostDefaultProps) {
  return (
    <Container>
      <header className="border-b">
        <div className="mx-auto py-10">
          <Breadcrumb />

          {post.categories.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.categories.map((category) => (
                <span
                  key={category.id}
                  className="text-sm font-medium text-primary"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{post.author.name}</span>

            <span>•</span>

            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString(
                "vi-VN",
              )}
            </time>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          {post.featured_image && (
            <div className="mb-10 overflow-hidden rounded-2xl">
              <img
                src={post.featured_image}
                alt={post.title}
                className="h-auto w-full object-cover"
              />
            </div>
          )}

          <div
            className="prose prose-neutral max-w-none"
            dangerouslySetInnerHTML={{
              __html: post.content,
            }}
          />
        </article>

        <aside>
          <div className="sticky top-24">
            <LatestPostsSection />
          </div>
        </aside>
      </div>
    </Container>
  );
}