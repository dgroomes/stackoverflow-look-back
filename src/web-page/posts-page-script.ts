import {PageWiring} from "../../web-extension-framework/page-wiring.ts";
import {AppStorage} from "../core/AppStorage.ts";
import {PostsExpander} from "../core/posts/PostsExpander.ts";

(async function () {
    console.debug("[posts-page-script.js] Initializing...");
    const pageWiring = PageWiring.initialize();
    const appStorage = new AppStorage(pageWiring.rpcClient);
    const postsExpander = new PostsExpander(pageWiring.webResourcesOrigin, appStorage);

    pageWiring.rpcServer.registerPromiseProcedure("expand-posts", (_procedureArgs) => {
        return postsExpander.expandPosts();
    });

    pageWiring.satisfied()
})().then(() => console.log("[posts-page-script.js] Initialized."));
