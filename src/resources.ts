import { ResourceTemplate } from "@modelcontextprotocol/server";
import { type PadrisimoMCP } from "./index.ts";
import { invariant } from "@epic-web/invariant";

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

  agent.server.registerResource(
    "tag",
    new ResourceTemplate("epicme://tags/{id}", {
      list: undefined,
    }),
    {
      title: "Tag",
      description: "A single tag with the given ID",
    },
    async (uri, { id }) => {
      const tag = await agent.db.getTag(Number(id));
      invariant(tag, `Tag with ID "${id}" not found`);
      return {
        contents: [
          {
            mimeType: "application/json",
            text: JSON.stringify(tag),
            uri: uri.toString(),
          },
        ],
      };
    },
  );

  agent.server.registerResource(
    "entry",
    new ResourceTemplate("padrismo://entries/{id}", {
      list: undefined,
    }),
    {
      title: "Entry",
      description: "An entry in the database",
    },
    async (uri, { id }) => {
      invariant(typeof id === "string", "id is required");
      const idNumber = Number(id);
      invariant(!isNaN(idNumber), "id must be a number");
      const entry = await agent.db.getEntry(idNumber);
      invariant(entry, `Entry with ID "${id}" not found`);
      return {
        contents: [
          {
            mimeType: "application/json",
            text: JSON.stringify(entry),
            uri: uri.toString(),
          },
        ],
      };
    },
  );
}
