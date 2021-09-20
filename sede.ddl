-- This is an oversimplified recreation of the DDL for the Stack Exchange Data Explorer (SEDE).
-- This file is only used by Intellij as a "DDL Data Source" so that I can get autocompletion in the IDE when writing
-- SQL queries against the SEDE.

CREATE TABLE Posts
(
    Id         int           not null,
    ParentId   int,
    PostTypeId tinyint       not null,
    Tags       nvarchar(250),
    Title      nvarchar(250),
    Body       nvarchar(max) not null
);
