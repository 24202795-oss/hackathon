# AGENTS.md

## Agent skills

### Issue tracker

Issues live as local markdown files under `.scratch/<feature>/` in this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical triage labels, each named for its role (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` plus `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Coding standards

Before committing: compile with `javac hackathon/*.java` from `src/` (zero errors required). Rules enforced by reviewers live in `CODING_STANDARDS.md` — read it before any code change; it exists because of bugs this project actually shipped.

### Spec source

The authoritative project plan (requirements, business rules, roles table, testing plan) is `docs/project-plan.md`. Compare code changes against it, not against remembered requirements.
