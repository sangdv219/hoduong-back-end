# Folder Structure - HODUONG-BACKEND

This document details the project layout and folder structure for the **HODUONG-BACKEND** project as seen in `Screenshot 2026-05-31 at 19.00.41.png`. The backend follows a modular, clean architecture pattern using TypeScript, incorporating domain-driven design elements, infrastructure abstractions, and isolated feature modules.

---

## 📂 Overview Diagram

```text
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
```

---

## 🗂️ Detailed Directory Descriptions

### Root Configuration & Meta Directories
*   **`.codex/`**: Internal configuration or documentation indices for AI/editor extensions.
*   **`.cursor/rules/`**: Custom behavior rules (`.cursorrules`) for the Cursor AI editor to ensure codebase style compliance.
*   **`.github/`**: CI/CD workflows, issue templates, and GitHub action configurations.
*   **`.scannerwork/`**: Temporary files generated during SonarQube / SonarCloud static code analysis scans.
*   **`dist/`**: The compiled JavaScript build output directory generated from the TypeScript source.
*   **`docs/`**: Central knowledge base harboring architecture specifications, ER diagrams, business logic rules, and API specifications.
*   **`plop/`**: Automation templates used with Plop.js to generate consistent boilerplate code (e.g., modules, controllers, services).
*   **`scripts/`**: Automation scripts for deployment, data migration, or development lifecycle helpers.
*   **`sequelize/`**: Configuration, database seeders, and migration scripts managing the SQL database schema via Sequelize ORM.
*   **`test/`**: End-to-end (E2E) integration test suites separate from unit tests.

### 🚀 Source Code (`src/`)
The primary application source code implementing a modular architecture layer:

*   **`audit/`**: Tracking logs, user action histories, and compliance audit trailing mechanisms.
*   **`bull/`**: Queue definitions and configuration managing asynchronous background tasks via BullMQ.
*   **`core/`**: Application-wide structural baselines, global guards, interceptors, and standard decorators.
*   **`domain/`**: Pure enterprise business rules, entities, and invariant business logic core independent of external frameworks.
*   **`error/`**: Centralized custom application error definitions, handlers, and HTTP exception filters.
*   **`infrastructure/`**: External layer integrations such as database models, third-party API clients, and network configurations.
*   **`processors/`**: Concrete job processors executing tasks queued up by the Bull framework.
*   **`redis/`**: Caching infrastructure mechanisms, connection managers, and pub/sub clients utilizing Redis.
*   **`shared/`**: Common utility helper functions, shared interfaces, and generic validation classes accessible across any module layer.
*   **`workers/`**: Dedicated background workers or cluster micro-processes executing resource-intensive operations.

### 📦 Feature Modules (`src/modules/`)
Features are encapsulated inside individual directories separating concerns into domain sub-domains. For instance, the expanded **`users/`** module showcases a strict pattern:
*   `controller/`: Inbound HTTP request handlers routing payloads to the use cases or services.
*   `dto/`: Data Transfer Objects validating incoming payloads and specifying structure for output objects.
*   `enum/`: TypeScript enums defining fixed domain states (e.g., User Roles, Account Statuses).
*   `repository/`: Data access abstraction layer isolating database operations from domain use cases.
*   `services/`: Shared business services facilitating calculations or multi-entity lookups.
*   `use-cases/`: Application workflow actions isolated into single-responsibility commands (e.g., `create-user.use-case.ts`).
*   `user.module.ts`: The central wiring file configuring Dependency Injection for the user scope.
*   `users.controller.spec.ts`: Unit test file specifying test definitions for the controller interfaces.

### Root Application Entrypoints
*   `app.module.ts`: Root module bootstrapping all sub-modules and core infrastructure configurations.
*   `app.controller.ts` & `app.service.ts`: Top-level application routes (e.g., healthchecks or uptime stats).
*   `main.ts`: Main entry point file launching the HTTP server instance.