import {PostsViewer} from "../core/posts/PostsViewer"
import {AppStorage} from "../core/AppStorage"
import * as BrowserExtensionFramework from "@dgroomes/browser-extension-framework"

const init: Promise<PostsViewer> = (async function init(): Promise<PostsViewer> {
    console.debug("[posts-viewer.js] Initializing...");
    const pageWiring = BrowserExtensionFramework.initializePageWiring();
    const postsViewer = await PostsViewer.init(new AppStorage(pageWiring.rpcClient));
    console.info("Initialized. Posts were fetched and summarized successfully");

    pageWiring.satisfied();

    return postsViewer;
})();

{ // Register the "download" button handler for click events
    document.getElementById("download-button")!.addEventListener("click", async () => {
        const postsViewer = await init;
        postsViewer.download();
    });
}

