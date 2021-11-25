export {Post, Question}

interface Post {
    id: number
    htmlBody: string
    type: string
    questionId: number

    naturalOrder(): number

    toHtml(): string

    toJSON(): string
}

interface Question extends Post {
    title: string
    tags: Array<string>
}
