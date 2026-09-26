import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";

const server = new McpServer(
  {
    name: "padrisimo",
    title: "padrisimo",
    version: "1.0.0",
  },
  {
    capabilities: { tools: {} },
    instructions: "This let u solve math problems and give you the answer.",
  },
);

server.registerTool(
  "add",
  {
    title: "Add",
    description: "Adds the numbers 1 and 2",
  },
  async () => {
    return {
      content: [{ type: "text", text: "The sum of 1 and 2 is 3." }],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Padridrisimo MCP server is running on stdio");
}

main().catch((error) => {
  console.error("Error starting the server:", error);
  process.exit(1);
});
