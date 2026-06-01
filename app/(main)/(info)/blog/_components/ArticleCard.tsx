"use client";

import Link from "next/link";
import Image from "next/image";
import { BlogArticle } from "../_data/articles";
import { createBEMClasses } from "@/_utils/classname";
import Tag from "@/_design_system/Tag";

const { block, element } = createBEMClasses("blog-article-card");

interface ArticleCardProps {
  article: BlogArticle;
  prioritizeImage?: boolean;
}

export default function ArticleCard({
  article,
  prioritizeImage = false,
}: ArticleCardProps) {
  const date = new Date(article.date);
  const month = new Intl.DateTimeFormat("pt-PT", {
    month: "long",
    timeZone: "UTC",
  }).format(date);
  const day = new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
  const year = new Intl.DateTimeFormat("pt-PT", {
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  const publicationDate = `${month[0].toUpperCase()}${month.slice(1)} ${day}, ${year}`;

  return (
    <Link href={`/blog/${article.slug}`} className={block()}>
      <div className={element("image-wrapper")}>
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 48rem) 100vw, (max-width: 62rem) 50vw, 33vw"
          className={element("image")}
          priority={prioritizeImage}
        />
        <Tag
          type="neutral"
          size="small"
          text={article.categories[0]}
          className={element("tag")}
        />
      </div>

      <div className={element("content")}>
        <h3 className={element("title")}>{article.title}</h3>
        <p className={element("description")}>{article.excerpt}</p>

        <div className={element("meta")}>
          <span>Por {article.author}</span>
          <span>·</span>
          <span>{publicationDate}</span>
          <span>·</span>
          <span>{article.readTime} min</span>
        </div>
      </div>
    </Link>
  );
}
