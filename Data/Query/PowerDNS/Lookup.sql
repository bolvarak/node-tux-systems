SELECT
	"public"."dns_record"."id"
FROM
	"public"."dns_record"
INNER JOIN "public"."dns_domain" ON (
	"public"."dns_domain"."id" = "public"."dns_record"."domain_id"
)
WHERE
	CONCAT("")
