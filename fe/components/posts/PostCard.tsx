import Image from "next/image";
import Link from "next/link";

import type { PostItem } from "@/services/post.service";

interface PostCardProps {
  post: PostItem;
}

export default function PostCard({
  post,
}: PostCardProps) {
  return (
    <article className="group overflow-hidden rounded-xl border bg-card">
      {post.featured_image && (
        <Link
          href={`/posts/${post.slug}`}
          className="block overflow-hidden"
        >
          <Image
            src={post.featured_image}
            alt={post.title}
            width={1200}
            height={675}
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        </Link>
      )}

      <div className="p-5">
        {post.categories.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
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

        <h2 className="text-xl font-semibold tracking-tight">
          <Link
            href={`/posts/${post.slug}`}
            className="transition-colors hover:text-primary"
          >
            {post.title}
          </Link>
        </h2>

        {post.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {post.excerpt}
          </p>
        )}

        <div className="mt-4 text-sm text-muted-foreground">
          {new Date(post.date).toLocaleDateString(
            "vi-VN",
          )}
        </div>
      </div>
    </article>
  );
}