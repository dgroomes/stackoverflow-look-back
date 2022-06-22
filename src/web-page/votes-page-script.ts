import * as BrowserExtensionFramework from "@dgroomes/browser-extension-framework"
import {AppStorage} from "../core/AppStorage"
import {VotesScraper} from "../core/votes/VotesScraper"

console.debug("[votes-page-script.js] Initializing...");
const pageWiring = BrowserExtensionFramework.initializePageWiring();
const appStorage = new AppStorage(pageWiring.rpcClient);

pageWiring.rpcServer.registerPromiseProcedure("scrape-votes", (procedureArgs: { votesPageLimit: number }) => {
    const votesScraper = new VotesScraper(procedureArgs.votesPageLimit, appStorage);
    return votesScraper.scrapeVotes();
});

pageWiring.satisfied();
console.log("[votes-page-script.js] Initialized.");
