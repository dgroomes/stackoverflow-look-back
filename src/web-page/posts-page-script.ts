import {
    BrowserExtensionFramework
} from "../../web-extension-framework/browser-extension-framework/api/browser-extension-framework.ts";
import {AppStorage} from "../core/AppStorage.ts";
import {PostsExpander} from "../core/posts/PostsExpander.ts";

console.debug("[posts-page-script.js] Initializing...");
const pageWiring = BrowserExtensionFramework.initializePageWiring();
const appStorage = new AppStorage(pageWiring.rpcClient);
const postsExpander = new PostsExpander(appStorage);

pageWiring.rpcServer.registerPromiseProcedure("expand-posts", (_procedureArgs) => {
    return postsExpander.expandPosts();
});

pageWiring.satisfied()
