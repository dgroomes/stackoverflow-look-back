/**
 * This is a partially implemented class (in Java it would be called an "abstract" class) that defines the base
 * functionality of the server component of a Remote Procedure Call (RPC) system. The unimplemented method "listen()" must
 * be implemented by the concrete sub-classes.
 */
class AbstractRpcServer {

    #promiseProcedures = new Map()
    #callbackProcedures = new Map()

    constructor() {
        if (this.constructor === AbstractRpcServer) {
            throw new Error("This should never be instantiated directly. Instantiate one of the extending classes.")
        }
    }

    /**
     * Sub-classes must implement this method to register the necessary "listener" to listen for remote procedure
     * requests. The listener must invoke "dispatch" for each request and send the return value of the procedure
     * to the client.
     */
    listen() {
    }

    dispatch(procedureName, procedureArgs) {
        console.debug(`[AbstractRpcServer.js] Dispatching RPC call for '${procedureName}'...`)
        if (this.#promiseProcedures.has(procedureName)) {
            let procedure = this.#promiseProcedures.get(procedureName)
            return procedure(procedureArgs)
        } else if (this.#callbackProcedures.has(procedureName)) {
            let procedure = this.#callbackProcedures.get(procedureName)
            return new Promise(resolve => {
                procedure(procedureArgs, resolve)
            })
        } else {
            throw new Error(`[AbstractRpcServer.js] This RPC request can't be executed. No procedure was registered with the name '${procedureName}'`)
        }
    }

    /**
     * Register a promise-returning procedure function that will handle RPC requests from the client for the given procedure name.
     *
     * When the server receives a request, it will take the procedure name from the request to look up a registered
     * procedure of the same name. If found, the procedure will be invoked with the "procedureArgs" contained in the
     * request and it will send the response to the client.
     *
     * @param procedureName the name of the procedure. All RPC request will include a procedure name so that the correct
     * procedure can be found by its name
     * @param procedure the procedure to execute on the server. It must take zero or one args. The first argument must
     * be the "procedureArgs". The procedure must return a Promise. The Promise should resolve with the return value of
     * interest when the procedure is finished its work.
     *
     * Note: I know this is unused... I'll delete it if I find I don't need it.
     */
    registerPromiseProcedure(procedureName, procedure) {
        this.#promiseProcedures.set(procedureName, procedure)
    }

    /**
     * Like 'registerPromiseProcedure' but for a callback-based procedure. The callback-based procedure is not expected
     * to a return a promise. Instead it finishes by calling a "resolve" function. A "resolve" function will be passed
     * as a second argument.
     */
    registerCallbackProcedure(procedureName, procedure) {
        this.#callbackProcedures.set(procedureName, procedure)
    }
}
