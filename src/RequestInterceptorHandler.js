/**
 * Intercept HTTP requests and add custom handler code.
 *
 * RequestInterceptorHandler is just an interface class and it should be implemented by class expressions.
 * RequestInterceptorHandler instances must be registered by a RequestInterceptorInstrumenter.
 */
class RequestInterceptorHandler {

    /**
     * Should this request interceptor handle the request or not
     *
     * @param data the response data of the request
     * @return {boolean}
     */
    shouldHandle(data) {
        throw new Error("This must be implemented")
    }

    /**
     * Execute the handler. For example, a handler might just add logging, or it could modify the actual data of a
     * response.
     */
    handle(response) {
        throw new Error("This must be implemented")
    }
}
