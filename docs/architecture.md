# Family Tree System Architecture

## Purpose

System for managing genealogy and family relationships.

## Core Features

- Create person
- Update person
- Search person
- Display family tree
- Manage relationships

## User Roles

### Guest

- View public tree

### Family Member

- Add descendants
- Update own information

### Admin

- Full access

## Architecture

Frontend
↓
NestJS API
↓
PostgreSQL
↓
Redis Cache

## Main Modules

- Person Module
- Relationship Module
- Family Module
- Media Module
- Audit Module
