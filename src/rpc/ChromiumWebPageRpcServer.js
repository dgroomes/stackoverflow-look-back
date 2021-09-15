/**
 * This is a concrete implementation of RpcServer for Chromium that runs in the web page and services RPC requests.
 *
 * Note: This RpcServer implementation does *not* send responses to the caller. I have decided not to implement that due
 * to the high complexity and low need. If needed, I can implement this.
 */
class ChromiumWebPageRpcServer extends RpcServer {

    constructor() {
        super("web-page-server")
    }

    listen() {
        let that = this
        window.addEventListener("message", ({data}) => {
            if (!that.intake(data)) {
                return false
            }

            that.dispatch(data)
        })
    }
}
