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
     *
     * This is pretty strange. But I need a way to provide an instance of the ChromeModeStorage where the calling
     * code knows that its type is ChromeModeStorage and not the generic AppStorage. I think Intellij/WebStorm's
     * JavaScript intellisense relies only on the "@return" docs annotation... is there a way to do an inline comment
     * and "cast" the variable just for intellisense?
     * @param {ChromeModeStorage} chromeModeStorage
     *
     * @param {Number} votesPageLimit
     * @param {VotesScraper} votesScraper
     */
    constructor(appStorage, chromeModeStorage, votesPageLimit, votesScraper) {
        window.appStorage = this.appStorage = appStorage
        window.chromeModeStorage = this.chromeModeStorage = chromeModeStorage
        window.votesPageLimit = this.votesPageLimit = votesPageLimit
        window.votesScraper = this.votesScraper = votesScraper
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
        let chromeModeStorage
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
            chromeModeStorage = appStorage
        } else {
            appStorage = new ManualModeStorage()
            chromeModeStorage = null
            votesPageLimit = null
        }

        let votesScraper = new VotesScraper()

        return new Config(appStorage, chromeModeStorage, votesPageLimit, votesScraper)
    }
}

