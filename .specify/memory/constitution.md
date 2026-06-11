<!--
Sync Impact Report
  Version change: 2.0.0 → 2.0.1
  Modified principles: I. Mandatory Code Comments in English (expanded with language-specific doc standards)
  Added sections: none
  Removed sections: none
  Templates requiring updates: none (Constitution Check unaffected)
  Follow-up TODOs:
    - TODO(RATIFICATION_DATE): original adoption date unknown – set manually
-->

# doku.md Constitution

## Core Principles

### I. Mandatory Code Comments in English (NON-NEGOTIABLE)
Every source code file MUST contain comments written in English. Commenting
code is mandatory — any function, class, method, or non-trivial block MUST
include an inline or docblock comment explaining its purpose, behavior, or
rationale. Comments MUST be in English regardless of the developer's native
language or the project's target audience. Automated linting MUST verify
comment presence. Any file without comments SHALL be rejected during code
review.

Comment format MUST follow the language's standard documentation convention:
- **PHP**: PHPDoc (`/** @param string $name ... */`)
- **Go**: GoDoc (`// Package x does ...` above declarations)
- **TypeScript / Svelte**: JSDoc / TSDoc (`/** @param name: string ... */`)
- **Shell / YAML / Dockerfile**: Inline `#` comments for non-trivial blocks
- **JavaScript/JSX**: JSDoc for functions, inline for logic

Rationale: Mandatory English comments ensure that every contributor,
regardless of background, can understand the intent behind any piece of
code. This is essential for long-term maintainability, onboarding, and
cross-team collaboration.

## Governance

This constitution supersedes all informal conventions and ad-hoc decisions.

- **Amendments**: MUST be proposed as a PR to this file, with rationale and
  migration guidance for affected artifacts. Amendments require maintainer
  approval.
- **Versioning**: MAJOR for incompatible principle changes; MINOR for new
  principles/sections; PATCH for clarifications and fixes.
- **Compliance**: Every feature plan MUST include a "Constitution Check"
  section verifying adherence. Violations MUST be documented with explicit
  justification in the Complexity Tracking table.
- **Review**: The constitution MUST be reviewed and updated at least once
  per quarter.

**Version**: 2.0.1 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2026-06-10
