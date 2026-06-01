"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPublishedArticles } from "./_data/articles";
import ArticleList from "./_components/ArticleList";
import { createBEMClasses } from "@/_utils/classname";
import Stack from "@/_design_system/Stack";
import Tag from "@/_design_system/Tag";
import Button from "@/_design_system/Button";

const { block, element } = createBEMClasses("blog");
const { block: featuredBlock, element: featuredElement } =
  createBEMClasses("blog-featured");

function BlogContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || undefined;
  const tag = searchParams.get("tag") || undefined;

  const sortedArticles = getPublishedArticles();

  const featuredArticle = sortedArticles[0];

  const date = new Date(featuredArticle.date);
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
    <div className={block()}>
      <section className={element("hero")}>
        <div className={element("hero-overlay")} />
        <div className={element("hero-content")}>
          <h1>Blog RINU</h1>
          <p>
            Descubra dicas, guias e tendências sobre organização de eventos.
            Desde eventos corporativos a celebrações sociais, explore tudo o que
            precisa saber para criar experiências memoráveis.
          </p>
        </div>
      </section>

      <section className={element("featured-section")}>
        <div className={featuredBlock()}>
          <Link
            href={`/blog?category=${encodeURIComponent(featuredArticle.categories[0])}`}
            className={featuredElement("category")}
          >
            <Tag
              type="info"
              size="medium"
              text={featuredArticle.categories[0]}
            />
          </Link>

          <div className={featuredElement("media")}>
            <Image
              src={featuredArticle.image}
              alt={featuredArticle.title}
              fill
              className={featuredElement("image")}
              priority
            />
          </div>

          <div className={featuredElement("content")}>
            <h2>{featuredArticle.title}</h2>
            <p>{featuredArticle.excerpt}</p>
            <div className={featuredElement("meta")}>
              <span>Por {featuredArticle.author}</span>
              <span>·</span>
              <span>{publicationDate}</span>
              <span>·</span>
              <span>{featuredArticle.readTime} min</span>
            </div>
            <Button
              type="primary"
              href={`/blog/${featuredArticle.slug}`}
              label="Ler artigo"
            />
          </div>
        </div>
      </section>

      <section className={element("grid-section")}>
        <div className={element("wrapper")}>
          <ArticleList
            articles={sortedArticles.slice(1)}
            initialCategory={category}
            initialTag={tag}
          />
        </div>
      </section>
    </div>
  );
}

function BlogLoading() {
  return (
    <Stack gap="3rem" className={block()}>
      <div className={element("header")}>
        <h1>Blog RINU</h1>
        <p>A carregar artigos...</p>
      </div>
    </Stack>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<BlogLoading />}>
      <BlogContent />
    </Suspense>
  );
}
