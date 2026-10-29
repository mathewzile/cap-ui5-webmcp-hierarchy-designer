import UI5Element from "sap/ui/core/Element";
import MessageToast from "sap/m/MessageToast";
import type Model from "sap/ui/model/Model";
import type ODataContextBinding from "sap/ui/model/odata/v4/ODataContextBinding";
import type ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import type Table from "sap/ui/mdc/Table";
// Side-effect type import: pulls in the global `document.modelContext` typings
import type {} from "webmcp-types";

/**
 * @namespace browsegenres
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

          WebMCPController.refreshListReport();
          MessageToast.show("Purge successful");
          return "ok";
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
          // See readme.md for a sample prompt and input
          if (!input || !input.nodes.length) {
            return;
          }

          // TODO: use Nested Single Entity create if possible https://ui5.sap.com/#/topic/c9723f8265f644af91c0ed941e114d46
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

          WebMCPController.refreshListReport();
          MessageToast.show(input.nodes.length + " nodes created");

          return "ok";
        },
        // annotations: {}
      },
      {
        signal: controller.signal,
      },
    );

    return controller;
  }

  /**
   * Refreshes the list report table's own list binding, so that the UI reflects the changes
   */
  private static refreshListReport(): void {
    const table = UI5Element.getElementById(
      "browsegenres::GenresList--fe::table::Genres::LineItem",
    ) as
      | (Table & { getRowBinding(): ODataListBinding | undefined })
      | undefined;
    table?.getRowBinding()?.refresh();
  }
}
