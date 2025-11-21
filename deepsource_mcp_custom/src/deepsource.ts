import axios from 'axios';

const DEEPSOURCE_API_URL = 'https://api.deepsource.com/graphql';

export interface Repository {
  id: string;
  name: string;
  vcsProvider: string;
  defaultBranch: string;
  owner: string; // mapped from login
}

export interface Issue {
  title: string;
  shortcode: string;
  severity: string;
  category: string;
  shortDescription: string;
  isRecommended: boolean;
  occurrences: Array<{
    path: string;
    beginLine: number;
    endLine: number;
  }>;
}

export class DeepSourceClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async query(query: string, variables: Record<string, any> = {}) {
    try {
      const response = await axios.post(
        DEEPSOURCE_API_URL,
        { query, variables },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const responseData = response.data as any;

      if (responseData.errors) {
        throw new Error(
          `DeepSource API Errors: ${JSON.stringify(responseData.errors)}`
        );
      }

      return responseData.data;
    } catch (error: any) {
      // Using type assertion as workaround for TS2339
      const isAxiosError = (err: any): boolean => {
          return err.isAxiosError === true;
      };

      if (isAxiosError(error)) {
        const axiosError = error as any;
        throw new Error(
          `DeepSource API Request Failed: ${axiosError.message} - ${JSON.stringify(
            axiosError.response?.data
          )}`
        );
      }
      throw error;
    }
  }

  async getAllRepositories(): Promise<Repository[]> {
    // Fetch all accounts first, then fetch repositories for each account with pagination
    const accountsQuery = `
      query {
        viewer {
          accounts {
            edges {
              node {
                login
                vcsProvider
              }
            }
          }
        }
      }
    `;

    const accountsData = await this.query(accountsQuery);
    const accounts = accountsData.viewer.accounts.edges;
    const repositories: Repository[] = [];

    for (const accountEdge of accounts) {
      const account = accountEdge.node;
      const owner = account.login;
      const vcsProvider = account.vcsProvider;

      let afterCursor: string | null = null;
      let hasNextPage = true;

      while (hasNextPage) {
          const repoQuery = `
            query($login: String!, $vcsProvider: VCSProvider!, $after: String) {
                account(login: $login, vcsProvider: $vcsProvider) {
                    repositories(first: 50, after: $after) {
                        pageInfo {
                            hasNextPage
                            endCursor
                        }
                        edges {
                            node {
                                id
                                name
                                vcsProvider
                                defaultBranch
                            }
                        }
                    }
                }
            }
          `;

          const repoData = await this.query(repoQuery, { login: owner, vcsProvider, after: afterCursor });

          if (!repoData.account || !repoData.account.repositories) {
              break;
          }

          const repoConnection = repoData.account.repositories;
          hasNextPage = repoConnection.pageInfo.hasNextPage;
          afterCursor = repoConnection.pageInfo.endCursor;

          for (const repoEdge of repoConnection.edges) {
              const repo = repoEdge.node;
              repositories.push({
                  id: repo.id,
                  name: repo.name,
                  vcsProvider: repo.vcsProvider,
                  defaultBranch: repo.defaultBranch,
                  owner: owner
              });
          }
      }
    }

    return repositories;
  }

  async getIssuesForRepository(owner: string, repoName: string, vcsProvider: string): Promise<Issue[]> {
    const allIssues: Issue[] = [];
    let afterCursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
        const query = `
        query($name: String!, $login: String!, $vcsProvider: VCSProvider!, $after: String) {
            repository(name: $name, login: $login, vcsProvider: $vcsProvider) {
            issues(first: 50, after: $after) {
                pageInfo {
                    hasNextPage
                    endCursor
                }
                edges {
                node {
                    issue {
                    title
                    shortcode
                    severity
                    category
                    shortDescription
                    isRecommended
                    }
                    occurrences {
                    edges {
                        node {
                        path
                        beginLine
                        endLine
                        }
                    }
                    }
                }
                }
            }
            }
        }
        `;

        const variables = {
            name: repoName,
            login: owner,
            vcsProvider: vcsProvider,
            after: afterCursor
        };

        const data = await this.query(query, variables);

        if (!data.repository || !data.repository.issues) {
            break;
        }

        const issueConnection = data.repository.issues;
        hasNextPage = issueConnection.pageInfo.hasNextPage;
        afterCursor = issueConnection.pageInfo.endCursor;

        const issueEdges = issueConnection.edges || [];

        for (const edge of issueEdges) {
            const node = edge.node;
            const issueInfo = node.issue;
            const occurrences = node.occurrences?.edges?.map((occEdge: any) => occEdge.node) || [];

            allIssues.push({
                title: issueInfo.title,
                shortcode: issueInfo.shortcode,
                severity: issueInfo.severity,
                category: issueInfo.category,
                shortDescription: issueInfo.shortDescription,
                isRecommended: issueInfo.isRecommended,
                occurrences: occurrences
            });
        }
    }

    return allIssues;
  }
}
