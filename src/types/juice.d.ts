declare module 'juice/client' {
  interface JuiceOptions {
    inlinePseudoElements?: boolean;
    preserveImportant?: boolean;
    applyAttributesTableElements?: boolean;
    applyWidthAttributes?: boolean;
    applyHeightAttributes?: boolean;
    webResources?: any;
    [key: string]: any;
  }

  interface JuiceClient {
    inlineContent(html: string, css: string, options?: JuiceOptions): string;
    inlineDocument(document: Document, css: string, options?: JuiceOptions): Document;
    [key: string]: any;
  }

  const juice: JuiceClient;
  export default juice;
}
