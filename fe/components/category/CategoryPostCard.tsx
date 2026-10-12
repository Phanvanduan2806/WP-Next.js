import Image from "next/image";
import Link from "next/link";

import type { PostItem } from "@/services/types/post";

interface CategoryPostCardProps {
  post: PostItem;
}

export default function CategoryPostCard({
  post,
}: CategoryPostCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      {post.featured_image && (
        <Link
          href={`/${post.slug}`}
          className="block overflow-hidden"
        >
          <div className="relative aspect-video">
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              unoptimized
            />
          </div>
        </Link>
      )}

      <div className="p-5">
        <h3 className="text-lg font-semibold leading-snug">
          <Link
            href={`/${post.slug}`}
            className="transition-colors hover:text-primary"
          >
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {post.excerpt}
          </p>
        )}

        <Link
          href={`/${post.slug}`}
          className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
        >
          Đọc bài viết →
        </Link>
      </div>
    </article>
  );
}