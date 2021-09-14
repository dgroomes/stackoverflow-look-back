/**
 * This is an interface class that defines the API for a Remote Procedure Call (RPC) client which makes RPC requests to
 * a receiving RPC server. For example, an RPC client on the web page may make an RPC request to an RPC server running
 * in a background script.
 */
class RpcClient {

    procedureTargetReceiver

    /**
     * @param procedureTargetReceiver the destination RPC server for RPC requests. This is needed to make sure the right RPC
     * server finds the request and all other RPC servers ignore it.
     */
    constructor(procedureTargetReceiver) {
        if (this.constructor === RpcClient) {
            throw new Error("This should never be instantiated directly. Instantiate one of the extending classes.")
        }

        if (!procedureTargetReceiver) {
            throw new Error(`Expected a truthy value for 'procedureTargetReceiver' but found ${procedureTargetReceiver}`)
        }

        this.procedureTargetReceiver = procedureTargetReceiver
    }

    /**
     * Execute a remote procedure call by sending a message to a receiving RPC server and waiting for the response.
     * @param procedureName the "procedure name" of the remote procedure call.
     * @param procedureArgs the "procedure arguments" of the remote procedure call.
     * @return {Promise} a promise containing the return value of the remote procedure call
     */
    execRemoteProcedure(procedureName, procedureArgs) {
    }
}

