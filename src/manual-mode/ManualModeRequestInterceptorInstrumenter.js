/**
 * This is an implementation of the RequestInterceptorInstrumenter for the "Manual" mode.
 */
class ManualModeRequestInterceptorInstrumenter extends RequestInterceptorInstrumenter {

    #instrumented = false

    /**
     * The list of interceptor handlers.
     */
    #handlers = []

    /**
     * Register a request interceptor handler.
     *
     * When a jQuery ajax request completes successfully, this handler and all other registered handlers will be
     * executed and then control will be passed back to jQuery.
     * @param {RequestInterceptorHandler} handler
     */
    register(handler) {
        if (!this.#instrumented) {
            this.#instrument()
        }
        this.#handlers.push(handler)
    }

    /**
     * Instrument the underlying HTTP request infrastructure. In the "Manual" mode, we are in the JavaScript execution
     * environment of the web page and so we have access to the jQuery object (note: the Stack Exchange Data Explorer
     * uses jQuery). jQuery is used to make HTTP requests via its "ajax" function. So, we can instrument the jQuery
     * object and the "ajax" function with custom interception code.
     *
     * To instrument jQuery we use a Proxy object. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy.
     *
     * Note: I think this is mostly overkill. I could get the same effect without the Proxy object and instead just redefine
     * the "ajax" method with a function that does the same thing. Proxy is awesome but might be overkill here. It and
     * Reflect are a pretty good API.
     */
    #instrument() {
        this.#instrumented = true
        let proxyHandler = {
            get: function (target, prop, receiver) {
                console.log(`Property '${prop}' was accessed on the jQuery object ($)`)
                let resolvedProp = Reflect.get(...arguments) // Get the "actual" property on the underlying proxied object.

                if (prop === "ajax") {
                    console.log(`Instrumenting a pointcut/aspect around 'ajax'`)

                    return function instrumented() {
                        console.log("'ajax' was invoked with: ")
                        console.log({...arguments})

                        // The 'ajax' function may take a variable amount of arguments. See the jQuery docs for the complete details: https://api.jquery.com/jquery.ajax/
                        // But for our sake, we only expect it to be called with exactly one argument, the "settings" object.
                        // Throw an error if the arguments do not meet our expectations.
                        let argLength = arguments.length;
                        if (argLength !== 1) {
                            throw new Error(`Length of arguments of size '${argLength}' for the 'ajax' function was not expected.`)
                        }
                        let arg0 = arguments[0];
                        let arg0Type = typeof arg0;
                        if (arg0Type !== "object") { // Technically this is not a perfect assertion. But it's good enough. We mostly want to assert that the argument is not a string but is instead an object. (Strings aren't objects in JavaScript.)
                            throw new Error(`Expected a string but found type '${arg0Type}' for argument '${arg0}' to the 'ajax' function`)
                        }

                        let settings = arg0 // arg0 is the "settings" object that the "ajax" function takes. See https://api.jquery.com/jquery.ajax/
                        let {success} = settings
                        if (!success) {
                            throw new Error("There was no 'success' callback defined in the settings for the ajax request. This is unexpected.")
                        }

                        // Proxy the "success" callback so that we can intercept the result set of successful queries to the Stack Exchange Data Explorer
                        settings.success = new Proxy(success, {
                            apply(target, thisArg, argumentsList) {
                                let responseData = argumentsList[0];

                                for (let handler of this.#handlers) {
                                    if (handler.shouldHandle(responseData)) {
                                        console.log("The handler matched for this request. Invoking it...")
                                        handler.handle(responseData)
                                    } else {
                                        console.log("The handler did not match for this request")
                                    }
                                }

                                // Finally, delegate to the underlying "original/normal/actual" function.
                                Reflect.apply(...arguments)
                            }
                        })

                        return resolvedProp.bind(receiver)(...arguments) // Invoke the "actual" property
                    }
                }
                return resolvedProp
            }
        }
        let proxy = new Proxy(window.$, proxyHandler);
        window.$ = proxy
        window.jQuery = proxy
    }
}
