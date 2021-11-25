// Learn more about TypeScript type declaration files (files ending in ".d.ts") from the docs: https://www.typescriptlang.org/docs/handbook/2/type-declarations.html

import {Post} from "./post.d.ts";
export {PostsViewer}

interface PostsViewer {
    init(): Promise<any>
    render(filter : (post: Post) => boolean): number
    render(filter : null): number
}
