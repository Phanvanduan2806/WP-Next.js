"use client";

import { usePathname } from "next/navigation";
import useSWR from "swr";

import {
  Breadcrumb as BreadcrumbUI,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { getBreadcrumbItems } from "@/services/client/breadcrumb.service";

function formatSlug(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Breadcrumb() {
  const pathname = usePathname();

  const { data: items, isLoading } = useSWR(
    pathname ? `breadcrumb-${pathname}` : null,
    () => getBreadcrumbItems(pathname),
  );

  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="mb-6">
      <BreadcrumbUI>
        <BreadcrumbList>
          <BreadcrumbItem>
            {segments.length === 0 ? (
              <BreadcrumbPage>Trang chủ</BreadcrumbPage>
            ) : (
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            )}
          </BreadcrumbItem>

          {segments.map((segment, index) => {
            const href =
              "/" + segments.slice(0, index + 1).join("/");
            const isLast = index === segments.length - 1;
            const item = items?.[index + 1];

            const label = item?.label ?? formatSlug(segment);
            const showSkeleton = isLoading && item?.isDynamic;

            return (
              <div key={href} className="contents">
                <BreadcrumbSeparator />

                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>
                      {showSkeleton ? (
                        <span className="inline-block h-4 w-28 animate-pulse rounded bg-muted align-middle" />
                      ) : (
                        label
                      )}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}>
                      {showSkeleton ? (
                        <span className="inline-block h-4 w-24 animate-pulse rounded bg-muted align-middle" />
                      ) : (
                        label
                      )}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            );
          })}
        </BreadcrumbList>
      </BreadcrumbUI>
    </div>
  );
}