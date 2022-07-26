package dgroomes.posts;

sealed public interface Post permits QuestionPost, AnswerPost {
  String htmlBody();

  long id();
}
