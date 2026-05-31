# API Contract - Family Tree System

## Base URL

/api/v1

---

# Authentication

## Login

POST /auth/login

Request

```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

Response

```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

---

# Family APIs

## Create Family

POST /families

## Get Family

GET /families/{id}

## Update Family

PATCH /families/{id}

---

# Person APIs

## Create Person

POST /persons

```json
{
  "familyId": "uuid",
  "firstName": "Nguyen",
  "lastName": "Duong",
  "gender": "MALE",
  "birthDate": "1999-10-30"
}
```

## Get Person

GET /persons/{id}

## Update Person

PATCH /persons/{id}

## Search Person

GET /persons?q=duong&page=1&limit=20

---

# Marriage APIs

## Create Marriage

POST /marriages

```json
{
  "husbandId": "uuid",
  "wifeId": "uuid",
  "marriedAt": "2020-01-01"
}
```

## Get Marriage

GET /marriages/{id}

---

# Relationship APIs

## Create Relationship

POST /relationships

```json
{
  "personId": "uuid",
  "relatedPersonId": "uuid",
  "relationshipType": "FATHER"
}
```

Relationship Types

- FATHER
- MOTHER
- CHILD
- SPOUSE
- BROTHER
- SISTER

---

# Family Tree APIs

## Get Ancestors

GET /persons/{id}/ancestors?depth=5

## Get Descendants

GET /persons/{id}/descendants?depth=5

## Get Tree

GET /persons/{id}/tree

---

# Media APIs

## Upload Photo

POST /media/photos

## Get Photo

GET /media/photos/{id}

---

# Audit APIs

## Get Audit Logs

GET /audit-logs

---

# Pagination Standard

```json
{
  "items": [],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

# Error Response Standard

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid input",
  "details": []
}
```

---

# Permission Matrix

| Action | Guest | Member | Admin |
|----------|----------|----------|----------|
| View Person | Y | Y | Y |
| Create Person | N | Y | Y |
| Update Person | N | Y | Y |
| Delete Person | N | N | Y |
| Manage Family | N | N | Y |
