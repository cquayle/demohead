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
  fullArticle?: unknown; // Strapi blocks: JSON array or string
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}
