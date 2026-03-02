export interface GitHubUser {
  nodeId: string;
  login: string;
  name?: string | null;
  avatarUrl?: string;
  bio?: string | null;
  location?: string | null;
}
