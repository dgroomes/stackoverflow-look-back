import {Vote} from "./votes/Vote"
import {Post} from "./posts/Post"
import {RpcClient} from "@dgroomes/browser-extension-framework"
import * as votes from "./votes/votes"
import * as posts from "./posts/posts"
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
     * @param votes
     * @return a promise that resolves when the votes have been successfully saved. The promise's string value indicates which storage backend was used.
     */
    saveVotes(votes : Vote[]) : Promise<string> {
        const votesMapped = votes.map(vote => vote.toJSON())

        return this.#rpcClient.execRemoteProcedure("save", {votes: votesMapped})
    }

    /**
     * Read the votes data from storage.
     */
    async getVotes() : Promise<Vote[]> {
        return this.#rpcClient.execRemoteProcedure("get", {key: "votes"})
            .then(returnValue => {
                return (returnValue as any).votes.map(voteData => votes.deserialize(voteData))
            })
    }

    /**
     * Saves posts data to storage
     */
    savePosts(posts: Post[]) : Promise<any> {
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
                resolve((found as any).posts)
            })
        })

        const postsData : Array<Post> = await promise
        return postsData.map(postData => posts.deserialize(postData))
    }
}

