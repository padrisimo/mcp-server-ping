import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';

const server = new McpServer(
  {
    name: "mcp-server-ping",
    title: "MCP Server Ping",
    description: "A simple server that responds to ping requests.",
    version: "1.0.0",
  },
  {
    instructions: "This server responds to ping requests with a pong response.",
  },
);

async function main() {
    const transport = new StdioServerTransport();
  await server.connect(transport);

}

