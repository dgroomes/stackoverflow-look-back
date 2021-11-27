// This code runs in the popup. It bootstraps the content scripts which then bootstrap the web page. It waits for user
// input when any of the "Scrape votes", "Expand posts", or "View posts" buttons are clicked in the popup.
//
// Note: this code is pretty awkward. It bootstraps the web page eagerly but shouldn't it only bootstrap the web page
// when needed? For example, when the "execute-scrape-votes" button is clicked, wouldn't that be a more appropriate time
// to boostrap the page? After all, if the "view-posts" button is clicked, there is no need to first boostrap the page,
// it just opens a new tab.

import {chrome} from "../../web-extension-types/chrome-extension-types.d.ts"
import {BackendWiring} from "../../web-extension-framework/backend-wiring.ts"

console.debug("[popup.js] Initializing...")

const votesPageLimitEl = document.getElementById("votes-page-limit") as HTMLInputElement

let frontEndReady = false
const backendWiringInit: Promise<BackendWiring> = BackendWiring.initialize("/backend/content-script-bootstrapper.js")

backendWiringInit.then(backendWiring => {
    backendWiring.rpcServer.registerCallbackProcedure("save", (procedureArgs, resolve) => {
        chrome.storage.local.set(procedureArgs, () => {
            console.debug("The extension successfully saved the data")
            resolve(true)
        })
    })

    backendWiring.rpcServer.registerCallbackProcedure("get", (procedureArgs, resolve) => {
        const key = procedureArgs.key
        chrome.storage.local.get(key, (found) => {
            console.debug("The extension successfully read the data")
            resolve(found)
        })
    })

    backendWiring.satisfied().then(() => frontEndReady = true);
});

document.getElementById("execute-scrape-votes")!
    .addEventListener("click", async () => {
        console.info(`[popup.js] Clicked the 'scrape votes' button`);
        if (!frontEndReady) throw new Error("Front end is not yet ready");
        const votesPageLimit = votesPageLimitEl.value;

        const backendWiring = await backendWiringInit;
        const votesScraped = backendWiring.rpcClient.execRemoteProcedure("scrape-votes", {votesPageLimit});
        console.info(`[popup.js] ${votesScraped} votes scraped!`);
    });


document.getElementById("execute-expand-posts")!
    .addEventListener("click", async () => {
        console.info(`[popup.js] Clicked the 'expand posts' button`);
        if (!frontEndReady) throw new Error("Front end is not yet ready");

        const backendWiring = await backendWiringInit;
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
