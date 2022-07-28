package dgroomes.posts;

sealed public interface Post permits QuestionPost, AnswerPost {
  long id();

  long questionId();

  String type();

  String htmlBody();
}
