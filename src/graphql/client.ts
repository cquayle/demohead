import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { setContext } from '@apollo/client/link/context';

// Get GraphQL endpoint from environment variable or use default
const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT || 'https://deserving-frogs-345174c2a8.strapiapp.com/graphql';

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
});

// Auth link to add authorization headers if token is available
const authLink = setContext((_, { headers }) => {
  // Get token from localStorage or environment variable
  const token = localStorage.getItem('strapi_token') || import.meta.env.VITE_STRAPI_TOKEN;
  
  return {
    headers: {
      ...headers,
      ...(token && { authorization: `Bearer ${token}` }),
    },
  };
});

export const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});
