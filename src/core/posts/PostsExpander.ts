// Given a collection of post IDs, expand the posts into the HTML body content and titles by querying the data from
// the Stack Exchange Data Explorer. See the README for more info.

import {instrumentJQuery, registerAjaxSuccessSpy} from "../../../util/jquery-proxy"
import {AppStorage} from "../AppStorage"
import {Vote} from "../votes/Vote"
import {QuestionPost} from "./QuestionPost"
import {AnswerPost} from "./AnswerPost"

export {PostsExpander}

class PostsExpander {

    #appStorage: AppStorage

    constructor(appStorage: AppStorage) {
        this.#appStorage = appStorage;
    }

    /**
     * Expand a list of post IDs into post objects by querying from the Stack Exchange Data Explorer
     *
     * @param {Array<Number>} ids the list of post IDs
     */
    expandByIds(ids) {
        console.debug({
            message: "Querying for post information for posts with IDs",
            id: ids
        })

        const sql = `
-- SQL Server SQL query to get posts by post IDs in the Stack Exchange Data Explorer (SEDE)

-- Parameterize the query on post IDs. There's not a good way to parameterize on a list so just use an nvarchar and split
-- the string on commas in the query. Beware of the the upper limit for an "in" clause. Although I doubt I'll hit it.
DECLARE @PostIds NVARCHAR(max) = ##PostIds## -- For example '39126853,4437573,1464812'

SELECT Id,
       ParentId,
       PostTypeId,
       Tags,
       Title,
       Body
FROM Posts
WHERE Id in (SELECT value FROM STRING_SPLIT(@PostIds, ','));
`;

        (<any>document.querySelector('.CodeMirror')).CodeMirror.setValue(sql) // Set the SQL query

        const runQueryBtn = document.getElementById("submit-query")!
        runQueryBtn.click(); // Click the 'Run Query' button to prompt the parameters field to show up. The query is not actually run.
        (<HTMLInputElement>document.querySelector('input[name=PostIds]')).value = `'${ids}'` // Set the parameter
        runQueryBtn.click() // Run the query
    }

    /**
     * This is the main function.
     *
     * @return {Promise<Number>} a promise that resolves when the posts data is successfully expanded and saved to storage.
     * The promise value equals the number of posts.
     */
    async expandPosts() {

        const votes: Array<Vote> = await this.#appStorage.getVotes()

        const promise = new Promise(resolve => {
            instrumentJQuery()
            registerAjaxSuccessSpy(async responseData => {

                // Take careful note. The web page will differ in the ways that it gets the result set. Sometimes,
                // it makes an initial POST request to kick off the SQL query on the back end. In this case,
                // there will be a later GET request to actually fetch the result set. In other cases, there
                // will be a POST request for a "saved query" and the response will include the result set.
                // I'm not sure how exactly this works but I think the Stack Exchange Data Explorer is doing
                // some caching on queries that it recognizes. In any case, check for the field "resultSets"
                // to see if the response has the data or not.
                const resultSets = responseData.resultSets
                if (resultSets) {
                    // Get the first element in the result sets array. When would this ever be more than one?
                    const {rows} = resultSets[0]

                    // Collect the post data from the rows
                    const posts = rows.map(([id, parentId, type, tags, title, body]) => {
                        if (type === 1) {
                            if (tags === null) {
                                tags = []
                            } else {
                                // The SQL query response for the "tags" value is formatted like this: <html><css><position>
                                // Each entry is surrounded by a leading "<" and a trailing ">".
                                // Use a regex to extract the tag strings and form them into an array.
                                //
                                // Reference https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll
                                const regex = /<([a-z-]*)>/g // Note: parentheses define a "capturing group" in a regular expression. We want to capture the value inside of the "<>" and not capture the "<" and ">" characters themselves.
                                const matches : ArrayLike<string> = (tags as any).matchAll(regex)

                                // Use Array.from instead of just ".map" because we have an Iterable object, which does not support functions like ".map" or ".forEach"
                                // Extract the matched element of the capturing group into a new array.
                                tags = Array.from(matches, match => match[1]) // Note: The element at index 1 is the capturing group match.
                            }
                            return new QuestionPost(id, tags, title, body)
                        } else {
                            return new AnswerPost(id, parentId, body)
                        }
                    })

                    await this.#appStorage.savePosts(posts)
                    console.info(`The posts data has been successfully expanded for ${posts.length} posts and saved to storage!`)
                    resolve(posts.length)
                }
            })
        })

        // Create a set of all the answer and question posts IDs. Use a Set data structure to avoid duplicates. When an
        // answer and its question are both up-voted (this is the common case), then we have two references to the question
        // ID. So, use a Set to avoid duplicates.
        const idsUnique = new Set((votes as any).flatMap(vote => vote.ids))
        const idsSorted = Array.from(idsUnique).sort() // Sorting the IDs is not needed, but helps for reproduce-ability and debugging.
        await this.expandByIds(idsSorted)
        return promise
    }
}
