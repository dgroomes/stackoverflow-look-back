// This code runs on the web page. It does some initialization to wire up the main objects and variables.

import {PageWiring} from "../../web-extension-framework/page-wiring.ts";
import {PostsExpander} from "../core/posts/PostsExpander.ts"
import {AppStorage} from "../core/AppStorage.ts"
import {VotesScraper} from "../core/votes/VotesScraper.ts"

export {exec}

console.debug("[web-load-source.js] Initializing...")

/**
 *  This is the main function
 */
async function exec() : Promise<PageWiring> {
    const pageWiring = PageWiring.initialize();

    const appStorage = new AppStorage(pageWiring.rpcClient);
    const postsExpander = new PostsExpander(pageWiring.webResourcesOrigin, appStorage);

    pageWiring.rpcServer.registerPromiseProcedure("scrape-votes", (procedureArgs) => {
        const votesScraper = new VotesScraper(procedureArgs.votesPageLimit, appStorage);
        return votesScraper.scrapeVotes();
    });

    pageWiring.rpcServer.registerPromiseProcedure("expand-posts", (_procedureArgs) => {
        return postsExpander.expandPosts();
    });

    console.debug(`[web-load-source.js] [${Date.now()}] Fully initialized.`)

    pageWiring.satisfied()

    return pageWiring
}
