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

// Paginated articles (Strapi 5 relay-style connection) for infinite scroll
export const GET_ARTICLES_CONNECTION = gql`
  query GetArticlesConnection($page: Int!, $pageSize: Int!) {
    articles_connection(pagination: { page: $page, pageSize: $pageSize }) {
      nodes {
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
      pageInfo {
        page
        pageSize
        pageCount
        total
      }
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
