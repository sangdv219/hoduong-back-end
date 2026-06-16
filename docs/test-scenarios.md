# Test Scenarios

## Family Module

### TS-FAM-001

Scenario:
Create family successfully

Input:
Valid family data

Expected:
201 Created

---

### TS-FAM-002

Scenario:
Duplicate family name

Expected:
409 Conflict

---

## Person Module

### TS-PER-001

Scenario:
Create person

Expected:
Success

---

### TS-PER-002

Scenario:
Create person without family

Expected:
Validation error

---

## Relationship Module

### TS-REL-001

Scenario:
Add parent child relationship

Expected:
Success

---

### TS-REL-002

Scenario:
Create circular relationship

Expected:
Rejected

Example:

A -> B
B -> C
C -> A

Expected:
400 Bad Request

---

### TS-REL-003

Scenario:
Add third biological parent

Expected:
Rejected

---

## Tree Module

### TS-TREE-001

Scenario:
Get ancestor tree

Expected:
Correct hierarchy

---

### TS-TREE-002

Scenario:
Get descendant tree

Expected:
Correct hierarchy

---

## Security

### TS-SEC-001

Scenario:
Access API without token

Expected:
401

---

### TS-SEC-002

Scenario:
Member accesses admin endpoint

Expected:
403

---

## Performance

### TS-PERF-001

Scenario:
Search 100,000 persons

Expected:
Response < 100ms

---

### TS-PERF-002

Scenario:
Load family tree

Expected:
Response < 300ms