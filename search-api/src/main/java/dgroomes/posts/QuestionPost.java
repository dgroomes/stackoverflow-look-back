package dgroomes.posts;

import java.util.List;

public record QuestionPost(long id, String htmlBody, String title, List<String> tags) implements Post {
    @Override
    public String type() {
        return "question";
    }

    @Override
    public long questionId() {
        return id;
    }
}
