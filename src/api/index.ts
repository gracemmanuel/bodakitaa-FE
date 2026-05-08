const BASE_URL = 'http://localhost:8000/graphql/';

export const graphqlClient = async (query: string, variables: any = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `JWT ${token}` } : {}),
  };

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables })
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
