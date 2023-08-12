package dgroomes;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import dgroomes.posts.AnswerPost;
import dgroomes.posts.Post;
import dgroomes.posts.QuestionPost;

import java.util.List;
import java.util.stream.Stream;

public class Posts {
    public static List<Post> readPostData() {
        String postsDataJson = Util.readClasspathResource("/posts-sample.json");

        JsonNode postsDataNode = Util.readTree(postsDataJson);
        ArrayNode posts = (ArrayNode) postsDataNode;
        Stream<JsonNode> postsStream = Util.toStream(posts);

        return postsStream.map(Posts::parsePost).toList();
    }

    public static Post parsePost(JsonNode jsonNode) {
        String htmlBody = jsonNode.get("htmlBody").asText();
        long id = jsonNode.get("id").asLong();
        long questionId = jsonNode.get("questionId").asLong();

        String type = jsonNode.get("type").textValue();
        if ("question".equals(type)) {
            var title = jsonNode.get("title").asText();
            var tags = ((ArrayNode) jsonNode.get("tags"));
            var tagsList = Util.toStream(tags).map(JsonNode::textValue).toList();
            return new QuestionPost(id, htmlBody, title, tagsList);
        } else {
            return new AnswerPost(id, questionId, htmlBody);
        }
    }
}
