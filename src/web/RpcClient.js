/**
 * This is an interface class that defines the API for a Remote Procedure Call (RPC) client from the web page to the
 * web extension back-end.
 */
class RpcClient {

    constructor() {
        if (this.constructor === RpcClient) {
            throw new Error("This should never be instantiated directly. Instantiate one of the extending classes.")
        }
    }

    /**
     * Execute a remote procedure call by sending a message to the extension back-end and waiting for the response.
     *
     * @param procedureName the "procedure name" of the remote procedure call.
     * @param procedureArgs the "procedure arguments" of the remote procedure call.
     * @return {Promise} a promise containing the return value of the remote procedure call
     */
    execRemoteProcedure(procedureName, procedureArgs) {
    }
}

