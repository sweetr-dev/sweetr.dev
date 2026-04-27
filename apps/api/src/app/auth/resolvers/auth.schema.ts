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
    redirectTo: String
  }

  input NewInstallationUrlInput {
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
    redirectTo: String @skipAuth
  }

  type Token {
    accessToken: String! @skipAuth
  }

  type Query {
    authProvider(input: AuthProviderInput!): AuthProviderResponse! @skipAuth
    newInstallationUrl(input: NewInstallationUrlInput!): String! @skipAuth
  }

  type Mutation {
    loginWithGithub(input: LoginWithGithubInput!): LoginWithGithubResponse!
      @skipAuth
  }
`;
