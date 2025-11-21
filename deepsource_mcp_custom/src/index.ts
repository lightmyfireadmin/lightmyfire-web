import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import axios from "axios";

const DEEPSOURCE_API_URL = "https://api.deepsource.io/graphql/";
const DEEPSOURCE_API_KEY = process.env.DEEPSOURCE_API_KEY;

if (!DEEPSOURCE_API_KEY) {
  console.error("DEEPSOURCE_API_KEY environment variable is required");
  process.exit(1);
}

// Define schemas for DeepSource API responses
interface GraphQLResponse<T> {
  data: T;
  errors?: any[];
}

interface ViewerResponse {
  viewer: {
    accounts: {
      edges: {
        node: {
          login: string;
          repositories: {
            edges: {
              node: {
                name: string;
                issues: {
                  edges: {
                    node: {
                      issue: {
                        title: string;
                        shortDescription: string;
                        severity: string;
                        category: string;
                      };
                      occurrences: {
                        totalCount: number;
                      };
                    };
                  }[];
                };
              };
            }[];
          };
        };
      }[];
    };
  };
}

const server = new Server(
  {
    name: "deepsource-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_issues",
        description:
          "Retrieve all detected issues from DeepSource for all repositories accessible to the user.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "list_issues") {
    try {
      const query = `
        query {
          viewer {
            accounts(first: 10) {
              edges {
                node {
                  login
                  repositories(first: 50) {
                    edges {
                      node {
                        name
                        issues(first: 100) {
                          edges {
                            node {
                              issue {
                                title
                                shortDescription
                                severity
                                category
                              }
                              occurrences {
                                totalCount
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await axios.post<GraphQLResponse<ViewerResponse>>(
        DEEPSOURCE_API_URL,
        { query },
        {
          headers: {
            Authorization: `Bearer ${DEEPSOURCE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.errors) {
        return {
          content: [
            {
              type: "text",
              text: `DeepSource API Error: ${JSON.stringify(
                response.data.errors
              )}`,
            },
          ],
          isError: true,
        };
      }

      const issuesList: any[] = [];

      const accounts = response.data.data.viewer.accounts.edges;
      for (const accountEdge of accounts) {
        const account = accountEdge.node;
        const repositories = account.repositories.edges;
        for (const repoEdge of repositories) {
          const repo = repoEdge.node;
          const issues = repo.issues.edges;

          if (issues.length > 0) {
             issuesList.push({
                repository: `${account.login}/${repo.name}`,
                issues: issues.map(issueEdge => ({
                    title: issueEdge.node.issue.title,
                    description: issueEdge.node.issue.shortDescription,
                    severity: issueEdge.node.issue.severity,
                    category: issueEdge.node.issue.category,
                    occurrences: issueEdge.node.occurrences.totalCount
                }))
             });
          }
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(issuesList, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching issues: ${
              error.response?.data ? JSON.stringify(error.response.data) : error.message
            }`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error("Tool not found");
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DeepSource MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
