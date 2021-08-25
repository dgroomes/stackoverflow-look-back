/**
 * This class encapsulates all configuration (at least, it should strive to encapsulate all configuration).
 */
class Config {

    static #initialized = false

    /**
     * Note: the assignment of variables to the window is quite strange... but I'm trying something and learning along
     * the way.
     *
     * @param {AppStorage} appStorage
     * @param {Number} votesPageLimit
     * @param {VotesScraper} votesScraper
     * @param {PostExpander} postExpander
     * @param {HtmlGenerator} htmlGenerator
     */
    constructor(appStorage, votesPageLimit, votesScraper, postExpander, htmlGenerator) {
        window.appStorage = this.appStorage = appStorage
        window.votesPageLimit = this.votesPageLimit = votesPageLimit
        window.votesScraper = this.votesScraper = votesScraper
        window.postExpander = this.postExpander = postExpander
        window.htmlGenerator = this.htmlGenerator = htmlGenerator
    }

    /**
     * Initialize the configuration.
     * @return {Promise<Config>}
     */
    static async init() {

        if (this.#initialized) throw new Error("Config was already initialized!")
        this.#initialized = true

        /**
         * Detect the mode that the tool is running in. The persistence functions will work differently depending on the mode.
         * The value is either "chrome-extension" or "manual"
         */
        let appStorage
        let votesPageLimit

        if (typeof chrome !== "undefined" &&
            typeof chrome.runtime !== "undefined" &&
            typeof chrome.runtime.id !== "undefined") {

            votesPageLimit = await new Promise((resolve) => {
                chrome.storage.sync.get("votesPageLimit", (data) => {
                    resolve(data.votesPageLimit)
                })
            })
            appStorage = new ChromeModeStorage(votesPageLimit)
        } else {
            appStorage = new ManualModeStorage()
            votesPageLimit = 1
        }

        let votesScraper = new VotesScraper()
        let postExpander = new PostExpander()
        let htmlGenerator = new HtmlGenerator()

        return new Config(appStorage, votesPageLimit, votesScraper, postExpander, htmlGenerator)
    }
}

