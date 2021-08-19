-- SQL Server SQL query to get posts by post IDs in the Stack Exchange Data Explorer (SEDE)

-- Parameterize the query on post IDs. There's not a good way to parameterize on a list so just use an nvarchar and split
-- the string on commas in the query. Beware of the the upper limit for an "in" clause. Although I doubt I'll hit it.
DECLARE @PostIds NVARCHAR(max) = ##PostIds## -- For example '39126853,4437573'

SELECT Id,
       ParentId,
       PostTypeId,
       Title,
       Body
FROM Posts
WHERE Id in (SELECT value FROM STRING_SPLIT(@PostIds, ','));
