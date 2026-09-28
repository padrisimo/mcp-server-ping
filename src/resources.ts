import { type PadrisimoMCP } from "./index.ts";

export async function initializeResources(agent: PadrisimoMCP) {
  agent.server.registerResource(
    "tags",
    "padrismo://tags",
    {
      title: "Tags",
      description: "Tags",
    },
    async (uri) => {
      const tags = await agent.db.getTags();
      return {
        contents: [
          {
            mimeType: "application/json",
            text: JSON.stringify(tags),
            uri: uri.toString(),
          },
        ],
      };
    },
  );
}
