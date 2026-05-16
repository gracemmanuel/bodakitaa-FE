import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink, concat } from '@apollo/client';

const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql/',
});

// Attach JWT token from localStorage to every request
const authMiddleware = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('token');
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      Authorization: token ? `JWT ${token}` : '',
    },
  }));
  return forward(operation);
});

const client = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});

export default client;
