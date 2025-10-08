# Architectural Decision Records (Lightweight)

| ID | Decision | Context | Status |
|----|----------|---------|--------|
| 001 | Use Next.js App Router + TS | Fast full-stack + SSR, matches assessment | Accepted |
| 002 | Tailwind + minimal component lib (later) | Speed over custom styling | Accepted |
| 003 | Start without real DB | 2-day scope; approvals ephemeral first | Accepted |
| 004 | Normalized average rating rule | Root null -> mean(categories) | Accepted |
| 005 | Single consolidated reviews endpoint | Simplicity; filtering via query params | Accepted |
| 006 | Add future approvals POST endpoint | Needed for persistence extension | Proposed |
| 007 | Keep API key server-side only | Security best practice | Accepted |

How to add: Append new row; keep IDs incremental.
