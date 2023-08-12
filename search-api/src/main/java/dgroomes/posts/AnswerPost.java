package dgroomes.posts;

public record AnswerPost(long id, long questionId, String htmlBody) implements Post {

    @Override
    public String type() {
        return "answer";
    }

    @Override
    public long questionId() {
        return questionId;
    }
}
