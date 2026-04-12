---
title: "Database: chose Postgres over SQLite"
tags: [database, architecture, infrastructure]
date: 2026-03-15
source: commit:abc1234
---

We needed row-level locking for concurrent writers, which SQLite
doesn't support well. Trade-off: deployment complexity for correctness.

PostgreSQL also gives us JSONB columns for flexible metadata storage
and a mature extension ecosystem (PostGIS, pg_trgm for full-text search).
