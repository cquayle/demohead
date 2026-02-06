/**
 * GraphQL / API types aligned with democms Article schema.
 * Article has: articleId, language, datetimePub, uri, title, sourceUri, imageUri, summary, fullStory (plain text).
 */

export interface Article {
  documentId: string;
  articleId: string;
  title?: string;
  summary?: string;
  datetimePub?: string;
  uri?: string;
  sourceUri?: string;
  imageUri?: string;
  language: string;
  fullStory?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

/** Input for createArticle / updateArticle mutations (ArticleInput in schema). */
export interface ArticleInput {
  articleId: string;
  title?: string;
  summary?: string;
  datetimePub?: string;
  uri?: string;
  sourceUri?: string;
  imageUri?: string;
  language: string;
  fullStory?: string;
}
