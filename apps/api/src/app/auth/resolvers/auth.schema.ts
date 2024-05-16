export default /* GraphQL */ `
  directive @skipAuth on FIELD_DEFINITION

  enum AuthProvider {
    GITHUB
    "Not supported"
    GITLAB
    "Not supported"
    BITBUCKET
  }

  input AuthProviderInput {
    provider: AuthProvider!
  }

  type AuthProviderResponse {
    redirectUrl: String! @skipAuth
  }

  input LoginWithGithubInput {
    code: String!
    state: String!
  }

  type LoginWithGithubResponse {
    token: Token! @skipAuth
  }

  type Token {
    accessToken: String! @skipAuth
  }

  type Query {
    authProvider(input: AuthProviderInput!): AuthProviderResponse! @skipAuth
  }

  type Mutation {
    loginWithGithub(input: LoginWithGithubInput!): LoginWithGithubResponse!
      @skipAuth
  }
`;
