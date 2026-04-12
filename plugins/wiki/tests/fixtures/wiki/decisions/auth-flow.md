---
title: "Auth: JWT with short-lived access tokens"
tags: [auth, security, decisions]
date: 2026-03-20
source: commit:def5678
---

Access tokens expire after 15 minutes. Refresh tokens are stored
server-side in the database (not in cookies) and rotate on each use.

We considered session-based auth but JWT lets us scale the API
horizontally without shared session storage.
