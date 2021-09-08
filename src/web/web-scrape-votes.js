console.log("[web-scrape-votes.js] Running...")

programReady.then(() => {
    votesScraper.scrapeVotes()
})
