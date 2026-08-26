# Agent Note: Strengthen Agent Note governance

Status: implemented

English | [中文](2026-08-26-strengthen-agent-note-governance.zh.md)

## Problem

The repository's portable Agent Note guide preserves Simon's proposal,
authorization, review, and acceptance gates, but it does not explain
supersession, implemented-note maintenance, consolidation, or archive selection
well enough. Archived notes are described as frozen without a mechanical seal.

## Decision

Keep the six-stage lifecycle and add four bounded safeguards:

- search scoped notes before creating one and classify extension, partial or
  full supersession, or independence;
- keep factual realization in implemented notes current without reversing their
  decision or rationale;
- retain or archive notes by future decision value, never quotas;
- seal archived bilingual triplets through an append-only SHA-256 manifest that
  rejects mutation, deletion, incomplete triplets, and unreviewed additions.

Keep the complete protocol in the local `agent_notes/README.md` and concise
routing rules in `AGENTS.md`. Adopt the workspace portable template while this
repository remains the independent owner of its copied governance files.

## Alternatives considered

- Adopt DeepSeek Harness unchanged: rejected because its shorter lifecycle does
  not represent Simon's explicit implementation authorization and acceptance.
- Put the full protocol in `AGENTS.md`: rejected because it would make startup
  instructions noisy and duplicate the local lifecycle guide.
- Keep archive immutability as policy only: rejected because regenerating a
  sidecar currently permits an archived record to change unnoticed.

## Consequences

- The local bilingual guide covers supersession, currentness, consolidation,
  future-value classification, and archive rules.
- The repository has an empty versioned archive manifest and a verifier whose
  focused test proves initial sealing, mutation and deletion rejection, and
  append-only growth.
- `AGENTS.md` routes agents to the new safeguards without duplicating the guide.
- Local governance checks and `git diff --check` pass.

### Trade-offs and residual risks

- Hash sealing intentionally makes casual archive repair impossible.
- Supersession and future value remain semantic judgments; mechanical checks
  cannot prove that every relevant prior decision was found.
- The portable guide can become ceremony if expanded beyond durable decisions,
  lifecycle, supersession, and archival.

## Verification

- `node tools/governance/verify_agent_notes.mjs`
- `node --test tools/governance/verify_agent_notes.test.mjs`
- `node tools/governance/verify_bilingual_docs.mjs`
- `git diff --check`
