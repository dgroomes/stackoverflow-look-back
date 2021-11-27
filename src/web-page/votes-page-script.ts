import {PageWiring} from "../../web-extension-framework/page-wiring.ts";
import {AppStorage} from "../core/AppStorage.ts";
import {VotesScraper} from "../core/votes/VotesScraper.ts";

console.debug("[votes-page-script.js] Initializing...");
const pageWiring = PageWiring.initialize();
const appStorage = new AppStorage(pageWiring.rpcClient);

pageWiring.rpcServer.registerPromiseProcedure("scrape-votes", (procedureArgs: { votesPageLimit: number }) => {
    const votesScraper = new VotesScraper(procedureArgs.votesPageLimit, appStorage);
    return votesScraper.scrapeVotes();
});

pageWiring.satisfied();
console.log("[votes-page-script.js] Initialized.");
