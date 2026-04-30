import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation TokenAuth($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
      payload
      refreshExpiresIn
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: UserInput!) {
    register(input: $input) {
      success
      message
      user {
        id
        username
        email
        role
      }
      token
    }
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(input: { email: $email }) {
      success
      message
    }
  }
`;

export const CONFIRM_PASSWORD_RESET = gql`
  mutation ConfirmPasswordReset($token: String!, $password: String!) {
    confirmPasswordReset(input: { token: $token, password: $password }) {
      success
      message
    }
  }
`;
