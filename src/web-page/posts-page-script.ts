import * as BrowserExtensionFramework from "@dgroomes/browser-extension-framework"
import {AppStorage} from "../core/AppStorage"
import {PostsExpander} from "../core/posts/PostsExpander"

console.debug("[posts-page-script.js] Initializing...");
const pageWiring = BrowserExtensionFramework.initializePageWiring();
const appStorage = new AppStorage(pageWiring.rpcClient);
const postsExpander = new PostsExpander(appStorage);

pageWiring.rpcServer.registerPromiseProcedure("expand-posts", (_procedureArgs) => {
    return postsExpander.expandPosts();
});

pageWiring.satisfied()
