# Coding Standards

## Architecture

Principles:

- Clean Architecture
- Domain Driven Design
- SOLID
- Hexagonal Architecture

---

## Project Structure

HODUONG-BACKEND/
├── .codex/
├── .cursor/
│   └── rules/
│       └── .cursorrules
├── .github/
├── .scannerwork/
├── dist/
├── docs/
│   ├── api-contract.md
│   ├── architecture.md
│   ├── business-rules.md
│   ├── CLAUDE.md
│   ├── coding-standard.md
│   ├── erd.md
│   ├── folder-structure.md
│   ├── performance-guideline.md
│   ├── schema.sql
│   └── tech-stack.md
├── node_modules/
├── plop/
├── scripts/
├── sequelize/
├── src/
│   ├── audit/
│   ├── bull/
│   ├── core/
│   ├── domain/
│   ├── error/
│   ├── infrastructure/
│   ├── modules/
│   │   ├── analytics/
│   │   ├── associations/
│   │   ├── auth/
│   │   ├── orders/
│   │   ├── password/
│   │   ├── permissions/
│   │   ├── profile/
│   │   ├── rbac/
│   │   ├── roles/
│   │   └── users/
            ├── controller/
            │   └── user.admin.controller.ts
            ├── dto/
            │   ├── user-auth.request.dto.ts
            │   ├── user.admin.request.dto.ts
            │   └── user.admin.response.dto.ts
            ├── enum/
            │   └── user.admin.enum.ts
            ├── repository/
            │   └── user.admin.repository.ts
            ├── services/
            │   └── user.service.ts
            ├── use-cases/
            │   ├── getAll/
            │   │   └── getall.use-case.ts
            │   ├── sign-in/
            │   │   └── sign-in.use-case.ts
            │   └── sign-up/
            │       └── signup.use-case.ts
            ├── user.module.ts
            └── users.controller.spec.ts
│   ├── processors/
│   ├── redis/
│   ├── shared/
│   ├── workers/
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
├── .dockerignore
├── .env.development
├── .env.production
├── .env.staging
├── .eslintrc.js
├── .eslintrc.json
├── .gitignore
├── .prettierignore
├── .prettierrc
├── .prettierrc.js
├── .sequelizerc
├── docker-compose.yml
├── Dockerfile
└── eslint.config.mjs
---

## Naming Convention

Class:
PascalCase

Example:
FamilyService

---

Variable:
camelCase

Example:
familyRepository

---

Database:

Table:
snake_case

Example:
family_member

Column:
snake_case

Example:
created_at

---

## API Standards

Versioning:

/api/v1

Example:

GET /api/v1/persons

---

Response Format

Success

{
  "success": true,
  "data": {}
}

Error

{
  "success": false,
  "message": "Validation error"
}

---

## Database Standards

Primary Key:
UUID

Foreign Key:
Mandatory

Soft Delete:
deleted_at

Timestamp:
created_at
updated_at

---

## PostgreSQL Standards

Required Indexes:

- family_id
- person_id
- father_id
- spouse_id

Use:

EXPLAIN ANALYZE

before production release.

---

## Testing Standards

Unit Test Coverage:

>= 80%

Critical Services:

>= 90%

---

## Logging Standards

Levels:

- ERROR
- WARN
- INFO
- DEBUG

Sensitive Data:

Never log:
- Password
- JWT Secret
- Refresh Token

---

## Git Standards

Branch:

feature/*
bugfix/*
hotfix/*

Commit:

feat:
fix:
refactor:
test:
docs: