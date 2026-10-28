import type Model from "sap/ui/model/Model";
import type ODataContextBinding from "sap/ui/model/odata/v4/ODataContextBinding";
import type ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { WebMCP } from "webmcp-types";

/**
 * @namespace browsegenre
 */
export default class WebMCPController {
  public static register(model: Model | undefined): AbortController | null {
    // Verify WebMCP browser availability
    const modelContext = document.modelContext;
    if (!modelContext || !modelContext.registerTool || !model) {
      return null;
    }

    // Register tools and abort controller
    const controller = new AbortController();
    void modelContext.registerTool(
      {
        name: "purge-nonfiction",
        title: "Purge Non-Fiction",
        description: "Tool to purge non-fiction entries",
        // inputSchema: {}
        execute: async () => {
          // Call unbounded action
          const actionBinding = model.bindContext(
            "/purgeNonFiction(...)",
          ) as ODataContextBinding;
          await actionBinding.invoke();

          model.refresh(); // TODO: just get the list binding and refresh model.bindList("/Genres").refresh();
        },
        // annotations: {}
      },
      {
        signal: controller.signal,
      },
    );
    void modelContext.registerTool(
      {
        name: "design-hierarchy",
        title: "Design Hierarchy",
        description: "Create a new root hierarchy with nested children",
        inputSchema: {
          type: "object",
          properties: {
            nodes: {
              // WebMCP Inspector extension's AI currently cannot have top-level array - so we wrap in `nodes` object
              type: "array",
              description: "Node of the hierarchy",
              items: {
                type: "object",
                properties: {
                  ID: {
                    type: "string",
                    description: "Node ID (UUID v4)",
                  },
                  parent_ID: {
                    type: "string",
                    description:
                      "Node ID of the parent (UUID v4) - do not set for root nodes",
                  },
                  name: {
                    type: "string",
                    description: "Name of the node",
                  },
                },
                required: ["ID", "name"],
              },
            },
          },
          required: ["nodes"],
        },
        execute: async (input: Record<"nodes", Record<string, string>[]>) => {
          // SAMPLE PROMPT:
          // Can you design a new hierarchy (one new root) for Music genres: root is "Metal" music, please suggest
          // the sub-genres (children) and sub-sub-genres (grandchildren). Use design-hierarchy tool to create it
          // SAMPLE INPUT:
          // {
          //   "nodes":[
          //       {
          //         "ID":"dd4de802-e148-4607-9dbb-243e2ec4e980",
          //         "name":"Root"
          //       },
          //       {
          //         "ID":"3a49edf7-9451-4738-abe6-90b909013e41",
          //         "parent_ID":"dd4de802-e148-4607-9dbb-243e2ec4e980",
          //         "name":"Child"
          //       },
          //       {
          //         "ID":"353abba6-51a2-4beb-923c-9c9d7213b769",
          //         "parent_ID":"3a49edf7-9451-4738-abe6-90b909013e41",
          //         "name":"Grandchild"
          //       }
          //   ]
          // }
          if (!input || !input.nodes.length) {
            return;
          }

          const list = model.bindList("/Genres") as ODataListBinding;
          const nodeContexts: Promise<void>[] = [];
          for (const entry of input.nodes) {
            const nodeContext = list.create(entry);
            const nodeContextCreated = nodeContext.created();
            if (nodeContextCreated) {
              nodeContexts.push(nodeContextCreated);
            }
          }
          await Promise.allSettled(nodeContexts);

          model.refresh(); // TODO: just get the list binding and refresh model.bindList("/Genres").refresh();
        },
        // annotations: {}
      },
      {
        signal: controller.signal,
      },
    );

    return controller;
  }
}
