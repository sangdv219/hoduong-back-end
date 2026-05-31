# Business Rules - Family Tree System

## Purpose

This document defines the business rules for the Family Tree System.
All backend validation, database constraints, and API behavior must follow these rules.

---

# 1. Family Rules

## BR-001
A person must belong to exactly one family.

## BR-002
A family must have at least one root ancestor.

## BR-003
Family names must be unique.

## BR-004
A family must have at least one active administrator.

## BR-005
A family cannot be deleted if it contains any members.

## BR-006
A root ancestor cannot have parents within the same family tree.

## BR-007
Every person must have a full name.

## BR-008
A person's birth date cannot be in the future.

## BR-009
A person's death date must be later than their birth date.

## BR-010
A person cannot be their own ancestor.

## BR-011
A person cannot be their own descendant.

## BR-012
Circular ancestry relationships are prohibited.

## BR-013
A parent must be older than their child.

## BR-014
A child can have at most two biological parents.

## BR-015
Biological parent relationships must be explicitly identified.

## BR-016
A person may have multiple spouse records over time.

## BR-017
A marriage start date must be earlier than its end date.

## BR-018
Only living persons can be marked as currently married.

## BR-019
Duplicate spouse relationships are not allowed.

## BR-020
A person can belong to only one generation level within a family tree.

## BR-021
Each person must have a unique identifier within a family.

## BR-022
A person cannot have duplicate parent-child relationships.

## BR-023
A parent-child relationship cannot be created if it introduces a cycle in the family tree.

## BR-024
Only administrators can modify family structure data.

## BR-025
Historical records must be retained after updates.

## BR-026
Deleted persons must be soft-deleted.

## BR-027
Family tree changes must be audited.

## BR-028
A person's gender is optional and can be unspecified.

## BR-029
A person may have multiple names or aliases.

## BR-030
Every family tree modification must record the actor and timestamp.
---


# 2. Person Rules

## PR-031
A person must have a full name.

## PR-032
A person's full name cannot exceed 255 characters.

## PR-033
A person's birth date cannot be in the future.

## PR-034
A person's death date must be later than their birth date.

## PR-035
A deceased person cannot be marked as alive.

## PR-036
A living person must not have a death date.

## PR-037
A person may have multiple aliases or nicknames.

## PR-038
A person may have an optional gender.

## PR-039
A person may have an optional biography.

## PR-040
A person may have an optional profile photo.

## PR-041
A person may have multiple contact records.

## PR-042
A person may have multiple residence records over time.

## PR-043
A person may have multiple occupation records.

## PR-044
A person may have multiple education records.

## PR-045
A person may have multiple notes or historical annotations.

## PR-046
A person's unique identifier must be immutable after creation.

## PR-047
A person's status must be either Alive, Deceased, or Unknown.

## PR-048
A person's age must be derived from birth and death dates.

## PR-049
A person cannot be permanently deleted if referenced by family relationships.

## PR-050
A person's creation and modification timestamps must be recorded.


---

# 3. Relationship Rules

## PR-051
A relationship must connect two valid persons.

## PR-052
A relationship cannot reference a deleted person.

## PR-053
A person cannot have a relationship with themselves unless explicitly supported by the relationship type.

## PR-054
Parent-child relationships must be directional.

## PR-055
Sibling relationships must be symmetrical.

## PR-056
A sibling relationship cannot exist without at least one shared parent.

## PR-057
Duplicate relationships of the same type are not allowed.

## PR-058
Relationship types must belong to the predefined relationship catalog.

## PR-059
Every relationship must record its creation date.

## PR-060
Relationship changes must be auditable.

# 4. Marriage Rules

## PR-061
A marriage must involve two distinct persons.

## PR-062
Marriage records must include a start date.

## PR-063
Marriage end dates are optional.

## PR-064
A marriage cannot end before it begins.

## PR-065
Only one active marriage with the same spouse pair may exist at a time.

## PR-066
Marriage records must support remarriage history.

## PR-067
Divorce records must preserve historical marriage information.

## PR-068
A deceased person cannot initiate a new marriage.

## PR-069
Marriage records must be linked to both spouses.

## PR-070
Marriage modifications must be logged.

# 5. Family Tree Rules

## PR-071
A family tree must have exactly one root node.

## PR-072
Every non-root person must be connected to the family tree.

## PR-073
Family trees must not contain cycles.

## PR-074
Orphan nodes are not allowed.

## PR-075
Generation levels must be derived consistently.

## PR-076
Tree traversal must produce deterministic results.

## PR-077
Family trees must support unlimited depth.

## PR-078
Archived persons must remain visible in historical views.

## PR-079
Family tree structure changes must preserve data integrity.

## PR-080
Tree rebuild operations must not alter historical relationships.

# 6. User & Permission Rules

## PR-081
Every user must have a unique account.

## PR-082
User email addresses must be unique.

## PR-083
Only authenticated users may access protected resources.

## PR-084
Only administrators may modify family structures.

## PR-085
Members may view only authorized family data.

## PR-086
Permission changes must be auditable.

## PR-087
Inactive users cannot perform write operations.

## PR-088
Users may belong to multiple families if authorized.

## PR-089
Administrative privileges may be revoked.

## PR-090
Role assignments must be recorded.

# 7. Audit Rules

## PR-091
All critical actions must be logged.

## PR-092
Audit logs must be immutable.

## PR-093
Audit logs must record actor information.

## PR-094
Audit logs must record timestamps.

## PR-095
Audit logs must record action types.

## PR-096
Audit logs must record affected entities.

## PR-097
Audit records must be searchable.

## PR-098
Audit records must be retained according to retention policies.

## PR-099
System-generated actions must be identifiable.

## PR-100
Audit logs must support compliance reporting.

# 8. Data Integrity Rules

## PR-101
Primary keys must be unique.

## PR-102
Foreign key references must remain valid.

## PR-103
Required fields must not be null.

## PR-104
Unique constraints must be enforced.

## PR-105
Data updates must preserve referential integrity.

## PR-106
Soft-deleted records must not appear in active views.

## PR-107
Historical data must not be overwritten.

## PR-108
Database transactions must be atomic.

## PR-109
Concurrent updates must be handled safely.

## PR-110
Data validation must occur before persistence.
