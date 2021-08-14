-- PARTIALLY ABANDONED
--
-- "Stuff that was useful" (bookmarked, upvoted)
--
-- Find all questions where any of these are true:
-- DONE I asked the question
-- NOT SUPPORTED (Unfortunately, this data is not available) I upvoted the question
-- I bookmarked the question
-- I upvoted an answer


-- Why is this query useful? While programming, I often face an issue for which I don't know the answer, but I know I've seen the answer on StackOverflow!
-- In these cases, I've likely upvoted an answer for the given question but I need to find the question. The problem is, StackOverflow doesn't support this in
-- its search bar. The best it provides is a paginated view of all answers I've upvoted, sorted in reverse chronoligical order. This is not worth navigating
-- becausure there are too many pages and it's too slow. I have voted 1,700+ times. There are 30 results per page. So that's 56 pages. If it takes 10 seconds
-- to view each page, then that would take 9 minutes to view all pages. On average, I would find an answer in 9/2 = 4.5 minutes and in the worst case 9 minutes.
--
-- Alternatively, if I know that I'm looking for a question or answer related to "Bash", I wish I could narrow down the result set to just those posts that are
-- tagged with "bash". This would take the search time down to a fraction of 9 minutes.
--
-- Here is an example. On 2021-08-08, I was writing a Bash script and I wanted to find this post: https://stackoverflow.com/a/246128/1333713
-- I am frequently looking for this post. I also have it bookmard so I can find it even faster because I've only bookmared 117 questions.


DECLARE @UserId int = ##UserId##



SELECT
    Posts.Id
FROM Posts
WHERE 
    Posts.OwnerUserId = @UserId
    and Posts.PostTypeId = 1 -- PostTypeId "1" identifies "question" posts
ORDER BY Posts.Id
