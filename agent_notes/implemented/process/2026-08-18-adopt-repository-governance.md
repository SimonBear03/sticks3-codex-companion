# Agent Note: Adopt repository governance

Status: implemented

English | [中文](2026-08-18-adopt-repository-governance.zh.md)

## Problem

The repository had detailed current-state, protocol, distribution, hardware,
and bridge documentation, but it lacked a portable Agent Notes lifecycle for
durable decisions, a concise bilingual architecture owner, and local governance
checks. Its strong evidence boundaries depended on contributors finding and
preserving several separate documents.

## Decision

The repository carries the universal governance protocol locally: a visible,
bilingual Agent Notes lifecycle and local verifiers; a concise bilingual
architecture map that routes to existing detail; and cold-start rules for
lightweight specification, evidence-based simplification, documentation
ownership, change-specific validation, and conditional postmortems. README,
`planning/current-state.md`, and protocol/distribution/hardware docs retain their
existing current-state ownership.

## Alternatives considered

- Depend on `planning/current-state.md` for both current state and permanent
  rationale. That would turn a live handoff into an append-only decision log.
- Copy protocol and device facts into Agent Notes. Their existing current docs
  already own those facts and should remain the single authorities.
- Depend only on workspace governance. That fails when the repo is opened on a
  Mac or another machine independently.

## Consequences

Agents receive a small system map before loading the detailed live handoff,
wire protocol, distribution plan, or hardware references. Durable rationale no
longer needs to accumulate in current-state documents. Evidence remains scoped:
Python and firmware checks on Linux do not imply macOS-helper, BLE, display,
controls, audio, power, flashing, thermal, or other physical-device validation.
No firmware, protocol, bridge, macOS, pairing, privacy, or hardware behavior changes.

## Verification

- `PYTHONPATH=bridge python3 -m unittest discover -s tests` passed all 94 tests.
- `.venv/bin/pio run -e sticks3` passed sequentially; RAM was 37,840 / 327,680
  bytes and flash was 1,101,757 / 3,342,336 bytes.
- `.venv/bin/pio run -e cardputer_adv` passed sequentially; RAM was 38,704 /
  327,680 bytes and flash was 1,056,765 / 3,342,336 bytes.
- The final firmware evidence uses sequential builds. An earlier parallel
  invocation was discarded after the targets contended over generated
  PlatformIO dependency/build state.
- `node tools/governance/verify_agent_notes.mjs` passed.
- `node tools/governance/verify_bilingual_docs.mjs` passed.
- `git diff --check` passed.
- macOS helper and physical-device checks were not run and are not claimed.
