import BaseComponent from "sap/fe/core/AppComponent";
import WebMCPController from "./webmcp";

/**
 * @namespace browsegenres
 */
export default class Component extends BaseComponent {
  private _webMcp: AbortController | null = null;

  public static metadata = {
    manifest: "json",
  };

  /**
   * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
   * @public
   * @override
   */
  public init(): void {
    super.init();
    this._webMcp = WebMCPController.register(this.getModel());
  }

  /**
   * The component is destroyed by UI5 automatically during the shutdown of the app and calls the exit method once.
   * @public
   * @override
   */
  public exit(): void {
    this._webMcp?.abort();
    super.exit();
  }
}
