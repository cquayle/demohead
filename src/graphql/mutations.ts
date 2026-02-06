import { gql } from '@apollo/client';

// Mutation to create an article (ArticleInput matches democms schema)
export const CREATE_ARTICLE = gql`
  mutation CreateArticle($data: ArticleInput!) {
    createArticle(data: $data) {
      documentId
      articleId
      title
      summary
      datetimePub
      uri
      sourceUri
      imageUri
      language
      fullStory
      createdAt
      updatedAt
    }
  }
`;

// Mutation to update an article
export const UPDATE_ARTICLE = gql`
  mutation UpdateArticle($documentId: ID!, $data: ArticleInput!) {
    updateArticle(documentId: $documentId, data: $data) {
      documentId
      articleId
      title
      summary
      datetimePub
      uri
      sourceUri
      imageUri
      language
      fullStory
      updatedAt
    }
  }
`;

// Mutation to delete an article
export const DELETE_ARTICLE = gql`
  mutation DeleteArticle($documentId: ID!) {
    deleteArticle(documentId: $documentId) {
      documentId
    }
  }
`;
