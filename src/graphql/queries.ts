import { gql } from '@apollo/client';

// Query to get all articles (matches democms Article schema)
export const GET_ARTICLES = gql`
  query GetArticles {
    articles {
      documentId
      articleId
      title
      summary
      datetimePub
      uri
      sourceUri
      imageUri
      lang
      fullStory
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

// Query to get a single article by documentId
export const GET_ARTICLE = gql`
  query GetArticle($documentId: ID!) {
    article(documentId: $documentId) {
      documentId
      articleId
      title
      summary
      datetimePub
      uri
      sourceUri
      imageUri
      lang
      fullStory
      createdAt
      updatedAt
      publishedAt
    }
  }
`;
