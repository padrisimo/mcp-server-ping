import { invariant } from "@epic-web/invariant";
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import z from "zod";

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
    description: "Add two numbers together.",
    inputSchema: z.object({
      firstNumber: z.number().describe("The first number to add."),
      secondNumber: z.number().describe("The second number to add."),
    }),
  },
  async ({ firstNumber, secondNumber }) => {
    invariant(secondNumber >= 0, "The second number must be non-negative.");
    return {
      content: [
        {
          type: "text",
          text: `The sum of ${firstNumber} and ${secondNumber} is ${firstNumber + secondNumber}.`,
        },
      ],
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
