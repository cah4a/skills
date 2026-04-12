---
title: "Full-text search via pg_trgm"
tags: [search, features, postgres]
date: 2026-04-01
source: snapshot:2026-04-01
---

Search uses PostgreSQL's pg_trgm extension for trigram-based
fuzzy matching. This avoids adding Elasticsearch as a dependency.

Indexed columns: title, description, tags. Search results are
ranked by similarity score with a 0.3 threshold.
