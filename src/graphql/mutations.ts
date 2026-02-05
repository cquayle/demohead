import { gql } from '@apollo/client';

// Mutation to create an article
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

// Mutation to create a category
export const CREATE_CATEGORY = gql`
  mutation CreateCategory($data: CategoryInput!) {
    createCategory(data: $data) {
      documentId
      name
    }
  }
`;

// Mutation to create an author
export const CREATE_AUTHOR = gql`
  mutation CreateAuthor($data: AuthorInput!) {
    createAuthor(data: $data) {
      documentId
      name
    }
  }
`;
