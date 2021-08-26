/**
 * This is an implementation of the RequestInterceptorInstrumenter for the "Chrome extension" mode.
 *
 * Consider using the Chrome extension API "chrome.webRequest" to intercept requests. See https://developer.chrome.com/docs/extensions/reference/webRequest/
 */
class ChromeModeRequestInterceptorInstrumenter extends RequestInterceptorInstrumenter {

    #instrumented = false

    /**
     * The list of interceptor handlers.
     */
    #handlers = []

    /**
     * Register a request interceptor handler.
     */
    register(handler) {
        if (!this.#instrumented) {
            this.#instrument()
        }
        this.#handlers.push(handler)
    }

    /**
     * Instrument all HTTP requests that the page makes by using the Chrome extension "webRequest" API.
     */
    #instrument() {
        this.#instrumented = true
        let that = this
        let callback = function () {
            console.log("Listener invoked for 'webRequest.onCompleted'")
            console.dir(arguments)

            let responseData = {} // todo get it from the listener callback

            for (let handler of that.#handlers) {
                if (handler.shouldHandle(responseData)) {
                    console.log("The handler matched for this request. Invoking it...")
                    handler.handle(responseData)
                } else {
                    console.log("The handler did not match for this request")
                }
            }
        }

        let filter = {urls: ["https://data.stackexchange.com/"]}

        chrome.webRequest.onCompleted.addListener(callback, filter)
    }
}
