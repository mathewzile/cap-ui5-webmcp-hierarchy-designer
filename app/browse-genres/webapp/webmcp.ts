import type Model from "sap/ui/model/Model";
import type { WebMCP } from "webmcp-types";

/**
 * @namespace browsegenre
 */
export default class WebMCPController {
  public static register(model: Model | undefined): AbortController | null {
    // Verify WebMCP browser availability
    const modelContext = document.modelContext;
    if (!modelContext || !modelContext.registerTool) {
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
        execute: () => {
          // Implement the logic to purge non-fiction entries here
          // eslint-disable-next-line no-alert
          alert("boo!");
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
