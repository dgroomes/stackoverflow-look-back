/**
 * Given a StackOverflow post, build a URL to it.
 */
export function StackOverflowPostLink({post}) {

    let url;
    if (post.type === "question") {
        url = `https://stackoverflow.com/questions/${post.id}`;
    } else {
        url = `https://stackoverflow.com/a/${post.id}`;
    }

    return <a href={url}>link</a>;
}
