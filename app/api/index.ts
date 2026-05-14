const BASE_URL = 'http://localhost:8000/graphql/';

export const graphqlClient = async (query: any, variables: any = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `JWT ${token}` } : {}),
  };

  // If query is a DocumentNode (from gql tag), extract the string
  const queryString = typeof query === 'string' ? query : query?.loc?.source?.body;

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: queryString, variables })
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || 'GraphQL Request Failed');
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message || 'GraphQL Error');
  }

  return result.data;
};
