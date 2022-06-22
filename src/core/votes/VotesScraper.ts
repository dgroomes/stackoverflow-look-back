import {Vote} from "./Vote"
import {AppStorage} from "../AppStorage"
import * as votes from "./votes"

export {VotesScraper}

/**
 * Scrape your own StackOverflow votes data from your profile page. See the README.
 *
 * This class will navigate to subsequents pages in the Votes tab and scrape the votes data. How? There's a pretty neat
 * trick we can use. Observe when the HTML contents of the votes changes and then trigger the scraping procedure again.
 * Rinse and repeat.
 */
class VotesScraper {

    readonly #votesPageLimit
    #votesPageObserver
    #appStorage: AppStorage
    votesTab?: HTMLElement // Get a handle on the "Votes tab" HTML element
    votes: Array<Vote> = [] // The votes data will be scraped from the HTML and collected into this array as instances of the "Vote" class
    attempts = 0

    /**
     * @param votesPageLimit the scraping process will be limited to this many pages of the votes data
     * @param appStorage
     */
    constructor(votesPageLimit : number, appStorage: AppStorage) {
        this.#votesPageLimit = votesPageLimit;
        this.#appStorage = appStorage;
    }

    private readonly VOTES_TAB = "user-tab-votes";

    /**
     * This is the main function
     * @return {Promise} a promise that resolves when the scraping has completed. The promise value is the number of votes scraped.
     */
    scrapeVotes() : Promise<number> {
        console.info(`Scraping votes...  [limit=${this.#votesPageLimit}]`)
        this.votesTab = this.queryVotesTab()

        let _resolve: (number) => void;
        const scrapeCompletedPromise = new Promise<number>(resolve => {
            _resolve = resolve;
        })
        this.#votesPageObserver = new MutationObserver(mutations => {
            for (const _mutation of mutations) {
                if (!this.votesTab!.isConnected) {
                    // The votes tab was disconnected! It must have been replaced by a new element.
                    this.votesTab = this.queryVotesTab()
                    this.scrapeCurrentPage()
                    setTimeout(() => this.nextVotesPage(_resolve), 1000) // Trigger the next votes page, but with rate limiting
                    return
                }
            }
        })

        this.#votesPageObserver.observe(document, {
            subtree: true, // Monitor all sub-elements (children, children of children, etc) for mutations
            childList: true, // Monitor for the addition and removal of elements on the target element,
        })

        this.scrapeCurrentPage();
        this.nextVotesPage(_resolve!);
        return scrapeCompletedPromise;
    }

    /**
     * Find the votes tab element.
     */
    private queryVotesTab() : HTMLElement {
        const el = document.getElementById(this.VOTES_TAB)
        if (el === null) throw new Error(`Expected to find the '${this.VOTES_TAB}' element but didn't find it. The site must have changed.`)
        return el;
    }

    /**
     * Scrape the current page of votes data.
     */
    scrapeCurrentPage() {
        this.attempts++

        // Get all votes in the "Votes" section.
        //
        // Answer vote elements have an anchor tag ('a') with a class named "answer-hyperlink"
        // Question vote elements have an anchor tag ('a') with a class named "question-hyperlink"
        //
        // Does this section include up-voted comments?
        const answerVotes: NodeListOf<HTMLAnchorElement> = this.votesTab!.querySelectorAll('a.answer-hyperlink')
        const questionVotes: NodeListOf<HTMLAnchorElement> = this.votesTab!.querySelectorAll('a.question-hyperlink')

        const votesCount = answerVotes.length + questionVotes.length
        if (votesCount === 0) throw new Error("Didn't find any vote elements! The site must have changed.")

        // Parse the data from each vote element
        for (const el of answerVotes) {
            const vote = votes.parseFromUrl(el.href, 'answer')
            this.votes.push(vote)
        }
        for (const el of questionVotes) {
            const vote = votes.parseFromUrl(el.href, 'question')
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
        const votes = this.votes
        const save = () => {
            this.#votesPageObserver.disconnect()
            this.#appStorage.saveVotes(votes)
                .then(() => {
                    console.info(`The votes data has been saved successfully`)
                    resolve(votes.length)
                })
        }

        if (this.attempts >= this.#votesPageLimit) {
            console.info(`The limit has been reached for 'next page' attempts. attempts=${this.attempts}`)
            save()
            return
        }

        const el = document.querySelector('a[rel=next]') as HTMLButtonElement
        if (el === null) {
            console.info("All pages of the votes tab have been visited. Saving the votes data to storage...")
            save()
            return
        }

        el.click()
    }
}
