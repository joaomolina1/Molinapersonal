import {
  getArticleBySlug,
  articles,
  getPublishedArticles,
} from "../_data/articles";
import RelatedArticles from "../_components/RelatedArticles";
import { createBEMClasses } from "@/_utils/classname";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Tag from "@/_design_system/Tag";

const { block, element } = createBEMClasses("blog-article");

function parseMarkdown(content: string): string {
  const lines = content.split("\n");
  const result: string[] = [];

  let inList = false;
  let inFaq = false;
  let pendingFaqQuestion: string | null = null;
  let faqAnswerBuffer: string[] = [];
  let inCta = false;
  let ctaLines: string[] = [];

  const closeList = () => {
    if (inList) {
      result.push("</ul>");
      inList = false;
    }
  };

  const flushFaqItem = () => {
    if (!pendingFaqQuestion) {
      return;
    }

    const answer = faqAnswerBuffer.join(" ").trim();
    result.push('<div class="faq-item">');
    result.push(`<dt>${applyInline(pendingFaqQuestion)}</dt>`);
    if (answer) {
      result.push(`<dd>${applyInline(answer)}</dd>`);
    }
    result.push("</div>");

    pendingFaqQuestion = null;
    faqAnswerBuffer = [];
  };

  const closeFaq = () => {
    if (inFaq) {
      flushFaqItem();
      result.push("</dl>");
      inFaq = false;
    }
  };

  const flushCta = () => {
    if (!inCta) {
      return;
    }

    const ctaText = ctaLines.join(" ").trim();
    result.push('<aside class="blog-article__cta">');
    if (ctaText) {
      result.push(`<p>${applyInline(ctaText)}</p>`);
    }
    result.push(
      '<a class="blog-article__cta-button" href="/search">Descobrir espaços</a>',
    );
    result.push("</aside>");

    inCta = false;
    ctaLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (line.startsWith("## ")) {
      const heading = line.slice(3).trim();
      const lowerHeading = heading.toLowerCase();

      if (inCta) {
        flushCta();
      }

      closeList();
      closeFaq();

      if (lowerHeading === "faq") {
        inFaq = true;
        result.push('<dl class="blog-article__faq">');
        continue;
      }

      if (lowerHeading === "cta") {
        inCta = true;
        continue;
      }

      result.push(`<h2>${applyInline(heading)}</h2>`);
      continue;
    }

    if (inCta) {
      if (trimmed) {
        ctaLines.push(trimmed);
      }
      continue;
    }

    if (inFaq) {
      if (!trimmed) {
        continue;
      }

      const faqQuestionMatch = trimmed.match(/^\*\*(.+)\*\*$/);
      if (faqQuestionMatch) {
        flushFaqItem();
        pendingFaqQuestion = faqQuestionMatch[1];
        continue;
      }

      faqAnswerBuffer.push(trimmed);
      continue;
    }

    if (line.startsWith("# ")) {
      closeList();
      result.push(`<h2>${applyInline(line.slice(2))}</h2>`);
    } else if (line.startsWith("### ")) {
      closeList();
      result.push(`<h3>${applyInline(line.slice(4))}</h3>`);
    } else if (line.startsWith("- ")) {
      if (!inList) {
        result.push("<ul>");
        inList = true;
      }
      result.push(`<li>${applyInline(line.slice(2))}</li>`);
    } else if (line.startsWith("> ")) {
      closeList();
      result.push(`<blockquote>${applyInline(line.slice(2))}</blockquote>`);
    } else if (!trimmed) {
      closeList();
    } else {
      closeList();
      result.push(`<p>${applyInline(trimmed)}</p>`);
    }
  }

  closeList();
  closeFaq();
  flushCta();

  return result.join("");
}

function applyInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

interface BlogArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Artigo não encontrado",
    };
  }

  const publishedSlugs = new Set(getPublishedArticles().map((a) => a.slug));
  const isFuture = !publishedSlugs.has(article.slug);

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      images: article.image,
    },
    ...(isFuture && { robots: { index: false, follow: false } }),
  };
}

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function BlogArticlePage({
  params,
}: BlogArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const publicationDate = new Date(article.date).toLocaleDateString("pt-PT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    image: `https://rinu.pt${article.image}`,
    datePublished: article.date,
    dateModified: article.date,
    author: { "@type": "Person", name: article.author },
    publisher: {
      "@type": "Organization",
      name: "RINU",
      url: "https://rinu.pt",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://rinu.pt/blog/${article.slug}`,
    },
  };

  return (
    <article className={block()}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={element("wrapper")}>
        <div className={element("breadcrumb")}>
          <Link href="/blog">Blog</Link>
          <span>›</span>
          <span>{article.categories[0]}</span>
        </div>

        <header className={element("header")}>
          <Link
            href={`/blog?category=${encodeURIComponent(article.categories[0])}`}
          >
            <Tag type="info" size="medium" text={article.categories[0]} />
          </Link>
          <h1>{article.title}</h1>
          <div className={element("metadata")}>
            <span>{article.author}</span>
            <span>·</span>
            <span>{publicationDate}</span>
            <span>·</span>
            <span>{article.readTime} min de leitura</span>
          </div>
        </header>
      </div>

      <div className={element("hero")}>
        <div className={element("hero-media")}>
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 81rem) 100vw, 81rem"
            className={element("image")}
          />
        </div>
      </div>

      <div
        className={element("content")}
        dangerouslySetInnerHTML={{ __html: parseMarkdown(article.content) }}
      />

      <RelatedArticles articleId={article.id} />
    </article>
  );
}
