import {Vote} from "./votes/Vote.ts"
import {Post} from "./posts/Post.ts"
import {RpcClient} from "../../browser-extension-framework/browser-extension-framework/rpc/rpc.ts"
import {chrome} from "../../browser-extension-framework/browser-types/chromium-types/global.d.ts"
export {AppStorage}

/**
 * An API for general storage and retrieval (i.e. reads/writes) of the domain data.
 */
class AppStorage {

    #rpcClient : RpcClient

    constructor(rpcClient) {
        this.#rpcClient = rpcClient
    }

    /**
     * Save the votes data to storage
     *
     * @param {Array<Vote>} votes
     * @return {Promise<string>} a promise that resolves when the votes have been successfully saved. The promise's string value indicates which storage backend was used.
     */
    saveVotes(votes : Array<Vote>) {
        const votesMapped = votes.map(vote => vote.toJSON())

        return this.#rpcClient.execRemoteProcedure("save", {votes: votesMapped})
    }

    /**
     * Read the votes data from storage.
     */
    async getVotes() : Promise<Array<Vote>> {
        return this.#rpcClient.execRemoteProcedure("get", {key: "votes"})
            .then(returnValue => {
                return (returnValue as any).votes.map(voteData => Vote.deserialize(voteData))
            })
    }

    /**
     * Saves posts data to storage
     */
    savePosts(posts: Array<Post>) : Promise<any> {
        const postsMapped = posts.map(post => post.toJSON())

        return this.#rpcClient.execRemoteProcedure("save", {posts: postsMapped})
    }

    /**
     * Get posts data from storage
     * @return {Array<Post>} posts
     */
    async getPosts() {
        const promise = new Promise<Array<Post>>(resolve => {
            chrome.storage.local.get("posts", (found) => {
                console.debug("Got this response from storage:")
                console.debug({found})
                resolve(found.posts)
            })
        })

        const postsData : Array<Post> = await promise
        return postsData.map(postData => Post.deserialize(postData))
    }
}

