# Performance Guideline

## Index Strategy

```sql
CREATE INDEX idx_person_family ON person(family_id);
CREATE INDEX idx_relationship_person ON relationship(person_id);
CREATE INDEX idx_relationship_related ON relationship(related_person_id);
```

## Search Optimization

Enable pg_trgm:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

Create search index:

```sql
CREATE INDEX idx_person_name_trgm
ON person
USING gin (
    (first_name || ' ' || last_name) gin_trgm_ops
);
```

## Recursive Query

Use WITH RECURSIVE for ancestor and descendant lookup.

Recommended:
- MAX_DEPTH = 20
- Prevent cyclic relationships
- Analyze execution plans regularly

## Scaling

- Cache popular trees with Redis
- Add pagination for large families
- Consider materialized views for reporting
