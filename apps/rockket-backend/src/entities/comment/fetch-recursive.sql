-- Top -> Down
WITH RECURSIVE all_comments AS (
	SELECT id, "parent_comment_id", text, resolved_at
	FROM public."entity_comments"
	WHERE id = '04f2f3ea-8e35-4db7-b616-957591ae2e74'

	UNION

	SELECT t.id, t."parent_comment_id", t.text, t.resolved_at
	FROM public."entity_comments" t
		INNER JOIN all_comments a ON a.id = t."parent_comment_id"
)
SELECT * FROM all_comments


-- Bottom -> Up
WITH RECURSIVE all_comments AS (
    SELECT id, "parent_comment_id", text, resolved_at
    FROM public."entity_comments"
    WHERE id = '04f2f3ea-8e35-4db7-b616-957591ae2e74'

    UNION

    SELECT t.id, t."parent_comment_id", t.text, t.resolved_at
    FROM public."entity_comments" t
        INNER JOIN all_comments a ON a."parent_comment_id" = t.id
)