import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { DeepSourceClient } from "./deepsource.js";
import dotenv from "dotenv";

dotenv.config();

const DEEPSOURCE_PAT = process.env.DEEPSOURCE_PAT;

if (!DEEPSOURCE_PAT) {
  console.error("Error: DEEPSOURCE_PAT environment variable is not set.");
  process.exit(1);
}

const deepSourceClient = new DeepSourceClient(DEEPSOURCE_PAT);

const server = new McpServer({
  name: "deepsource-mcp-server",
  version: "1.0.0",
});

server.tool(
  "get_all_issues",
  "Retrieves all issues from all accessible repositories in DeepSource.",
  {},
  async () => {
    try {
      const repositories = await deepSourceClient.getAllRepositories();
      const allIssues = [];

      for (const repo of repositories) {
        try {
            const issues = await deepSourceClient.getIssuesForRepository(
                repo.owner,
                repo.name,
                repo.vcsProvider
            );

            if (issues.length > 0) {
                allIssues.push({
                    repository: `${repo.owner}/${repo.name}`,
                    vcsProvider: repo.vcsProvider,
                    issues: issues
                });
            }
        } catch (err: any) {
            console.error(`Failed to fetch issues for ${repo.owner}/${repo.name}: ${err.message}`);
            // Continue with other repositories
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(allIssues, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching issues: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DeepSource MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
