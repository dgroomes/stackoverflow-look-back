/**
 * Instrument the HTTP infrastructure code to enable custom request interception.
 *
 * This is an interface class. The implementation details are platform-specific. Specifically, there are different
 * concrete implementations for the "Chrome extension" and "Manual" modes.
 *
 * Note: Yes, this class name is a mouthful! Yes, it looks like I'm writing JavaScript code in a Java style!
 */
class RequestInterceptorInstrumenter {

    constructor() {
        if (this.constructor === RequestInterceptorInstrumenter) {
            throw new Error("This should never be instantiated directly. Instantiate one of the extending classes.")
        }
    }

    /**
     * Register a request interceptor handler.
     *
     * When an HTTP request completes successfully, this handler and all other registered handlers will be
     * executed and then control will be passed back to the original infrastructure.
     * @param {RequestInterceptorHandler} handler
     */
    register(handler) {
    }
}
