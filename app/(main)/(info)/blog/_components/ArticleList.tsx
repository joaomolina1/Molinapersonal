"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BlogArticle,
  getPublishedCategories,
  getPublishedTags,
  searchArticles,
} from "../_data/articles";
import ArticleCard from "./ArticleCard";
import { createBEMClasses } from "@/_utils/classname";
import { TextButton } from "@/_design_system/Button";
import InputText from "@/_design_system/InputText";
import Chip from "@/_design_system/Chip";

const { block, element } = createBEMClasses("blog-list");

const ARTICLES_PER_PAGE = 10;

function buildPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");

  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p++
  ) {
    pages.push(p);
  }

  if (current < total - 2) pages.push("…");
  pages.push(total);

  return pages;
}

interface ArticleListProps {
  articles: BlogArticle[];
  initialCategory?: string;
  initialTag?: string;
}

export default function ArticleList({
  articles,
  initialCategory,
  initialTag,
}: ArticleListProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : [],
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialTag ? [initialTag] : [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showTags, setShowTags] = useState(Boolean(initialTag));
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;
  const isInitialRender = useRef(true);
  const currentPage = Math.max(
    1,
    parseInt(searchParams.get("page") ?? "1", 10),
  );
  const publishedCategories = getPublishedCategories();
  const publishedTags = getPublishedTags();

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const params = new URLSearchParams(searchParamsRef.current.toString());

    if (params.get("page") && params.get("page") !== "1") {
      params.set("page", "1");
      router.replace(`/blog?${params.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, selectedTags, searchQuery]);

  const filteredArticles = useMemo(() => {
    let result = articles;

    if (searchQuery) {
      result = searchArticles(searchQuery).filter((article) =>
        articles.some((a) => a.id === article.id),
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((article) =>
        article.categories.some((cat) => selectedCategories.includes(cat)),
      );
    }

    if (selectedTags.length > 0) {
      result = result.filter((article) =>
        article.tags.some((tag) => selectedTags.includes(tag)),
      );
    }

    return result;
  }, [articles, searchQuery, selectedCategories, selectedTags]);

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedArticles = filteredArticles.slice(
    (safePage - 1) * ARTICLES_PER_PAGE,
    safePage * ARTICLES_PER_PAGE,
  );

  const buildPageUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page === 1) params.delete("page");
      else params.set("page", String(page));
      const qs = params.toString();
      return qs ? `/blog?${qs}` : "/blog";
    },
    [searchParams],
  );

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedTags.length > 0 ||
    searchQuery.length > 0;

  return (
    <div className={block()}>
      <div className={element("filters")}>
        <div className={element("search")}>
          <InputText
            label="Pesquisar artigos"
            showLabel={false}
            placeholder="Procurar artigos…"
            value={searchQuery}
            onChange={(value) => setSearchQuery(value)}
          />
        </div>

        <div className={element("categories")}>
          <div className={element("chip-row")}>
            <Chip
              type="button"
              size="medium"
              label="Todas"
              checked={selectedCategories.length === 0}
              onClick={() => setSelectedCategories([])}
            />
            {publishedCategories.map((category) => (
              <Chip
                key={category}
                type="button"
                size="medium"
                label={category}
                checked={selectedCategories.includes(category)}
                onClick={() => toggleCategory(category)}
              />
            ))}
          </div>
        </div>

        <div className={element("tags-toggle")}>
          <TextButton
            text={showTags ? "Ocultar filtros" : "Mais filtros"}
            onClick={() => setShowTags((prev) => !prev)}
          />
          {hasActiveFilters && (
            <TextButton text="Limpar filtros" onClick={clearFilters} />
          )}
        </div>

        {showTags && (
          <div className={element("tags")}>
            <div className={element("chip-row", { small: true })}>
              {publishedTags.map((tag) => (
                <Chip
                  key={tag}
                  type="button"
                  size="small"
                  label={tag}
                  checked={selectedTags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={element("articles")}>
        {filteredArticles.length > 0 ? (
          paginatedArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))
        ) : (
          <div className={element("no-results")}>
            <p>Nenhum artigo encontrado com os filtros selecionados.</p>
            <TextButton text="Limpar filtros" onClick={clearFilters} />
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="blog-pagination" aria-label="Navegação de páginas">
          <Link
            href={buildPageUrl(safePage - 1)}
            className={`blog-pagination__btn${safePage === 1 ? " blog-pagination__btn--disabled" : ""}`}
            aria-label="Página anterior"
            aria-disabled={safePage === 1}
            tabIndex={safePage === 1 ? -1 : undefined}
          >
            &#8592;
          </Link>

          {buildPageNumbers(safePage, totalPages).map((item, idx) =>
            item === "…" ? (
              <span key={`e-${idx}`} className="blog-pagination__ellipsis">
                …
              </span>
            ) : (
              <Link
                key={item}
                href={buildPageUrl(item)}
                className={`blog-pagination__page${item === safePage ? " blog-pagination__page--active" : ""}`}
                aria-label={`Página ${item}`}
                aria-current={item === safePage ? "page" : undefined}
              >
                {item}
              </Link>
            ),
          )}

          <Link
            href={buildPageUrl(safePage + 1)}
            className={`blog-pagination__btn${safePage === totalPages ? " blog-pagination__btn--disabled" : ""}`}
            aria-label="Próxima página"
            aria-disabled={safePage === totalPages}
            tabIndex={safePage === totalPages ? -1 : undefined}
          >
            &#8594;
          </Link>
        </nav>
      )}
    </div>
  );
}
