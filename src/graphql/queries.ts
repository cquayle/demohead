import { gql } from '@apollo/client';

// Query to get all articles
export const GET_ARTICLES = gql`
  query GetArticles {
    articles {
      documentId
      articleId
      title
      body
      datetime
      datetimePub
      uri
      sourceUri
      imageUri
      language
      createdAt
      updatedAt
      publishedAt
      categories {
        documentId
        uri
      }
      authors {
        documentId
        authorId
        givenName
        familyName
      }
    }
  }
`;

// Query to get a single article by ID
export const GET_ARTICLE = gql`
  query GetArticle($id: ID!) {
    article(id: $id) {
      documentId
      articleId
      title
      body
      datetime
      datetimePub
      uri
      sourceUri
      imageUri
      language
      createdAt
      updatedAt
      publishedAt
      categories {
        documentId
        uri
      }
      authors {
        documentId
        authorId
        givenName
        familyName
      }
      concepts {
        documentId
        uri
      }
      places {
        documentId
        name
      }
    }
  }
`;

// Query to get all categories
export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      documentId
      uri
    }
  }
`;

// Query to get all authors
export const GET_AUTHORS = gql`
  query GetAuthors {
    authors {
      documentId
      authorId
      givenName
      familyName
    }
  }
`;
