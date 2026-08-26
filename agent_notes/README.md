# Agent Notes

English | [中文](README.zh.md)

Agent Notes are the repository's durable proposals and decision records. They
preserve why a decision exists, which genuine alternatives lost, what the
decision gives up, and what evidence establishes the result. Current docs and
code describe what exists; Agent Notes preserve reasoning those surfaces cannot
carry safely.

## Layout And Classes

Active notes use `{lifecycle}/{class}/yyyy-mm-dd-topic.md`.

- `proposed`: shaped proposal awaiting explicit implementation authorization.
- `building`: explicitly authorized work that is unfinished.
- `review`: verified candidate implementation awaiting Simon's acceptance.
- `implemented`: accepted shipped decision, written in the present tense and
  kept factually current.
- `rejected`: declined proposal retained only while it prevents a plausible,
  meaningful mistake.
- `archived`: frozen, low-future-value implemented decision; never current authority.

Each note uses one class from this closed set:

- `feature`: new user- or agent-facing capability.
- `bug-fix`: correction of a defect or gap.
- `simplification`: removal without adding a capability.
- `architecture`: structure, ownership, or runtime relationships in shipped source.
- `process`: tooling, policy, or workflow around the code.
- `testing`: test infrastructure or strategy.

`refactor` is not a class. Name the reason for the change. The lifecycle/class
tree and repository search are the inventory; do not create a centralized index.
The filename date is when the topic was first proposed. Cross-references use
relative Markdown links so lifecycle moves remain repairable.

## Before Creating A Note

Search active Agent Notes for the same decision, mechanism, ownership boundary,
or rejected alternative before adding a file. Classify the relationship:

- **Duplicate:** update the existing owner; do not create another note.
- **Extension:** update the existing owner when the decision and rationale remain
  the same; create a linked note only for a genuinely separate decision.
- **Partial supersession:** create the new owner, keep both notes active, and
  cross-link the surviving responsibilities.
- **Full supersession:** create the new owner and consolidate or archive the old
  implemented note only after preserving every unique useful proposition.
- **Independent:** create the new note and link it only when useful to readers.

Settle known obsolete proposals and rejected notes in the same coherent change.
Never rewrite an older note into the opposite decision, and never rely on Git
history as the only remaining copy of useful rationale.

## When A Note Is Required

Add or update an Agent Note for a non-trivial change to behavior, architecture,
a shared contract, process or tooling, testing strategy, configuration, durable
or wire formats, security rules, ownership, or another decision a future
maintainer may reasonably revisit.

Purely mechanical or local edits with no change to behavior, structure,
contracts, process, or rationale are exempt. A task, issue, branch, pull request,
queue, chat, or agent loop does not replace the owning Agent Note and does not
grant implementation authority.

## Lifecycle And File Format

Every active note begins:

```markdown
# Agent Note: <title>

Status: <status>
```

The lifecycle directory and matching `Status:` line are the only canonical work
state. The status must be `proposed`, `building`, `review`, `implemented`, or
`rejected — <short reason>` as appropriate.

### Proposed

```markdown
## Problem
## Proposal
## Alternatives considered
## Acceptance criteria
## Risks
```

A proposed note is shaped and review-ready but does not authorize implementation.
The problem must stand independently of the preferred solution. Alternatives
must be genuine and never invented to satisfy the format.

### Building

Building retains the proposed structure and uses `Status: building`. Moving the
complete triplet from proposed to building records explicit implementation
authorization. Building means authorized and unfinished; it does not mean an
agent or worker is continuously active.

### Review

Review retains the building structure, adds `## Verification` after `## Risks`,
and uses `Status: review`. Move to review only when the implementation claims to
satisfy every acceptance criterion with proportionate evidence. Requested
changes return the complete triplet to building.

### Implemented

```markdown
## Problem
## Decision
## Alternatives considered
## Consequences
## Verification
```

Only Simon-accepted shipped work moves from review to implemented. Rewrite the
note into present-tense reality: remove proposal-era plans and acceptance
checklists, record what the trade-off bought and cost, and retain the evidence
that pins the decision.

Keep paths, symbols, defaults, mechanisms, and other factual realization current
in the same change that moves them. Rewrite stale facts in place; do not append a
chronological change log. This is not permission to rewrite the decision or its
rationale. A reversal requires a new Agent Note and explicit supersession.

### Rejected

Rejected notes retain their proposal-time body and use:

```text
Status: rejected — <short reason>
```

Treat a rejected note as a settled proposal, not a place for a new decision.
Keep it only while the rejected idea remains tempting and its rationale prevents
re-litigation. Otherwise delete the complete triplet and repair inbound links.
Rejected notes are never archived.

## Supersession And Consolidation

An implemented note is fully superseded only when no surviving code,
configuration, schema, durable data, wire behavior, migration, compatibility
path, ownership rule, security condition, or useful rationale still depends on
it. Removing one transport, default, implementation, or presentation is partial
supersession when another part survives.

Before consolidating or deleting a fully superseded implemented note, preserve
in the current owner every unique:

- motivation and constraint;
- alternative and why it lost;
- consequence and capability given up;
- negative guarantee or security rule;
- required verification and named coverage gap;
- condition for reintroduction.

Repair every inbound link and remove the complete English, Chinese, and sidecar
triplet together. Partial supersession never qualifies for consolidation: keep
both notes active, factually current, and cross-linked.

## Archiving

Classify notes by future decision value, never age, length, or a target quota.

- Keep an implemented note active when its rationale, alternatives, ownership
  boundary, negative guarantee, durable or wire semantics, security rule, or
  reintroduction condition is likely to guide future work.
- Archive an implemented note when the shipped decision is complete and its body
  is unlikely to guide future work.
- Never archive proposed, building, review, or rejected notes.

Archival moves the complete triplet to `archived/<class>/`, retains
`Status: implemented`, inserts the same `Archived: YYYY-MM-DD` line immediately
below the status in both language files, re-records the sidecar, repairs inbound
active links, and seals all three files in `agent_notes/archive-manifest.json`.
Those are the only permitted archival content changes.

Before adding seals, run:

```bash
node tools/governance/verify_agent_notes.mjs --write-archive-manifest
```

Write mode first verifies every existing seal and adds only new valid archived
files. After sealing, never edit, translate, reformat, move, or delete an
archived file. Archived notes are historical snapshots, not current authority;
new facts and decisions belong in active docs or notes.

## Bilingual Contract

Every Agent Note is one equal-authority triplet:

```text
topic.md
topic.zh.md
topic.i18n.yaml
```

Either language may be authored first. Both Markdown files express the same
decision and mirror headings, list shape, tables, links, and code blocks. The
machine-checked `# Agent Note:` and `Status:` tokens remain in English.

Editing either language requires updating the other and re-recording the
sidecar:

```bash
node tools/governance/verify_bilingual_docs.mjs --write <file>
```

The unsuffixed `.md` path is the ecosystem default, not higher authority. Every
lifecycle move includes all three files, updates both status lines, re-records
the sidecar, and repairs inbound links.

## Validation

Run the repository's documented gates plus:

```bash
node tools/governance/verify_agent_notes.mjs
node --test tools/governance/verify_agent_notes.test.mjs
node tools/governance/verify_bilingual_docs.mjs
git diff --check
```

Mechanical validation cannot prove that a proposal is worthwhile, alternatives
are honest, supersession is complete, acceptance evidence is sufficient, or an
archive has no future decision value. Those remain semantic review duties.
