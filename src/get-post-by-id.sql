-- SQL Server SQL query to get a post by its post ID in the Stack Exchange Data Explorer (SEDE)
DECLARE @PostId int = ##PostId##

SELECT
    Id, PostTypeId, Title, Body
FROM Posts
WHERE
    Id = @PostId
