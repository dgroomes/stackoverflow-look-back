// This code runs in the popup. It bootstraps the content scripts which then bootstrap the web page. It waits for user
// input when any of the "Scrape votes", "Expand posts", or "View posts" buttons are clicked in the popup.

import {chrome} from "../../browser-extension-framework/browser-types/chromium-types/global.d.ts"
import {BackendWiring} from "../../browser-extension-framework/browser-extension-framework/api/backend-wiring.ts"
import {BrowserDescriptor, BrowserExtensionFramework} from "../../browser-extension-framework/browser-extension-framework/api/browser-extension-framework.ts";

console.debug("[popup.js] Initializing...")

/**
 * Only the "execute-scrape-votes" and "execute-expand-posts" buttons require that the backend RPC procedures be
 * registered. The "view-posts" button doesn't need any backend components, it just opens a new tab.
 */
function registerProcedures(backendWiring: BackendWiring) {
    backendWiring.rpcServer.registerCallbackProcedure("save", (procedureArgs, resolve) => {
        chrome.storage.local.set(procedureArgs, () => {
            console.debug("The extension successfully saved the data");
            resolve(true);
        });
    });

    backendWiring.rpcServer.registerCallbackProcedure("get", (procedureArgs, resolve) => {
        const key = procedureArgs.key;
        chrome.storage.local.get(key, (found) => {
            console.debug("The extension successfully read the data");
            resolve(found);
        });
    });
}

document.getElementById("execute-scrape-votes")!
    .addEventListener("click", async () => {
        console.info(`[popup.js] Clicked the 'scrape votes' button`);

        // Note: we're not supporting Firefox because I can't actually test with Firefox.
        const backendWiring = await BrowserExtensionFramework.initializeBackendWiring(BrowserDescriptor.CHROMIUM);
        await backendWiring.injectInstrumentedPageScript("web-page/votes-page-script.js")

        await registerProcedures(backendWiring);

        const votesPageLimit = (document.getElementById("votes-page-limit") as HTMLInputElement).value;

        const votesScraped = await backendWiring.rpcClient.execRemoteProcedure("scrape-votes", {votesPageLimit});
        console.info(`[popup.js] ${votesScraped} votes scraped!`);
    });


document.getElementById("execute-expand-posts")!
    .addEventListener("click", async () => {
        console.info(`[popup.js] Clicked the 'expand posts' button`);

        // Note: we're not supporting Firefox because I can't actually test with Firefox.
        const backendWiring = await BrowserExtensionFramework.initializeBackendWiring(BrowserDescriptor.CHROMIUM);
        await backendWiring.injectInstrumentedPageScript("web-page/posts-page-script.js")

        await registerProcedures(backendWiring);

        const postsExpanded = backendWiring.rpcClient.execRemoteProcedure("expand-posts", null);
        console.info(`[popup.js] ${postsExpanded} posts expanded!`);
    })

document.getElementById("view-posts")!
    .addEventListener("click", async () => {
        console.info(`[popup.js] Clicked the 'view posts' button`);

        chrome.tabs.create({
            url: '/web-page/posts-viewer.html'
        });
    });
