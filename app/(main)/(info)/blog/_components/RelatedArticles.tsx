import { getRelatedArticles } from "../_data/articles";
import ArticleCard from "./ArticleCard";
import { createBEMClasses } from "@/_utils/classname";

const { block, element } = createBEMClasses("blog-related");

interface RelatedArticlesProps {
  articleId: string;
}

export default function RelatedArticles({ articleId }: RelatedArticlesProps) {
  const relatedArticles = getRelatedArticles(articleId, 3);

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <section className={block()}>
      <div className={element("wrapper")}>
        <h2 className={element("title")}>Artigos relacionados</h2>
        <div className={element("grid")}>
          {relatedArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
