/**
 * Scrape your own StackOverflow votes data from your profile page. See the README.
 *
 * This class will navigate to subsequents pages in the Votes tab and scrape the votes data. How? There's a pretty neat
 * trick we can use. Observe when the HTML contents of the votes changes and then trigger the scraping procedure again.
 * Rinse and repeat.
 */
class VotesScraper {

    votesTab // Get a handle on the "Votes tab" HTML element
    votes = [] // The votes data will be scraped from the HTML and collected into this array as instances of the "Vote" class
    attempts = 0

    /**
     * This is the main function
     * @return {Promise} a promise that resolves when the scraping has completed. The promise value is the number of votes scraped.
     */
    scrapeVotes() {
        console.info(`Scraping votes...  [limit=${votesPageLimit}]`)
        this.votesTab = document.getElementById("user-tab-votes")
        let that = this // Accommodate the awkwardness of ES6 classes

        let _resolve
        let observer = new MutationObserver(function (mutations) {
            for (let mutation of mutations) {
                if (!that.votesTab.isConnected) {
                    // The votes tab was disconnected! It must have been replaced by a new.
                    that.votesTab = document.getElementById("user-tab-votes")
                    that.scrapeCurrentPage()
                    setTimeout(() => that.nextVotesPage(_resolve), 1000) // Trigger the next votes page, but with rate limiting
                    return
                }
            }
        })

        observer.observe(document, {
            subtree: true, // Monitor all sub-elements (children, children of children, etc) for mutations
            childList: true, // Monitor for the addition and removal of elements on the target element,
        })

        let scrapeCompletedPromise = new Promise(resolve => {
            _resolve = resolve
        })

        this.scrapeCurrentPage()
        this.nextVotesPage(_resolve)
        return scrapeCompletedPromise
    }

    /**
     * Scrape the current page of votes data.
     */
    scrapeCurrentPage() {

        // Get all row elements of the "Votes cast" table.
        //
        // Each row represents an up-voted question OR up-voted answer. (Does it include up-voted comments?). All rows have
        // the 'data-postid' attribute so we can query using that fact.
        let votesRows = this.votesTab.querySelectorAll('tr[data-postid]')

        // Extract the data from each vote row HTML element.
        //
        // Note that each row will either be an up-voted question or up-voted answer:
        // * Answer rows will always have an anchor tag ('a') with a class named "answer-hyperlink"
        // * Question rows will always have an anchor tag ('a') with a class named "question-hyperlink"
        for (let row of votesRows) {

            // All rows will have an anchor tag which links to the up-voted post. This anchor tag is always inside of a
            // 'b' tag.
            let anchor = row.querySelector('b a')

            let postType
            if (anchor.classList.contains('question-hyperlink')) {
                postType = "question"
            } else if (anchor.classList.contains('answer-hyperlink')) {
                postType = "answer"
            } else {
                throw new Error(`Did not find the expected HTML class that identifies this row as a question or answer. 
anchor tag: ${anchor.outerHTML}
row: ${row.outerHTML}
`)
            }

            let vote = Vote.parseFromUrl(anchor.href, postType)
            this.votes.push(vote)
        }
        console.info(`Found ${this.votes.length} total votes!`)
    }

    /**
     * Navigate to the next page in the votes tab. This function is instrumented with a volume limiter so that we don't
     * accidentally trigger a barrage of page loads due to programming error.
     *
     * @param resolve This is a Promise's "resolved" function. It will be invoked when the nextVotePage has scraped the
     * last page and saved the data. This is a pretty awkward design! Consider how to restructure it.
     */
    nextVotesPage(resolve) {
        let votes = this.votes

        function save() {
            appStorage.saveVotes(votes)
                .then(() => {
                    console.info(`The votes data has been saved successfully`)
                    resolve(votes.length)
                })
        }

        if (++this.attempts > votesPageLimit) {
            console.info(`The limit has been reached for 'next page' attempts. attempts=${this.attempts}`)
            save()
            return
        }

        let el = document.querySelector('a[rel=next]')
        if (el === null) {
            console.info("All pages of the votes tab have been visited. Saving the votes data to storage...")
            save()
            return
        }

        el.click()
    }
}
