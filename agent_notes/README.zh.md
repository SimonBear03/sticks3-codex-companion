# Agent Notes

[English](README.md) | 中文

Agent Note 是仓库的持久提案和决策记录。它保存 decision 为什么存在、哪些真实
alternative 落选、decision 放弃了什么，以及哪些 evidence 能证明结果。Current doc
和 code 描述现状；Agent Note 保存这些 surface 无法安全承载的 reasoning。

## Layout And Classes

Active note 使用 `{lifecycle}/{class}/yyyy-mm-dd-topic.md`。

- `proposed`：已经成形、等待明确实施授权的 proposal。
- `building`：已经明确授权但尚未完成的工作。
- `review`：已经验证、等待 Simon 验收的 candidate implementation。
- `implemented`：已经验收并交付的 decision，使用现在时书写并保持事实最新。
- `rejected`：只在能防止 plausible、meaningful mistake 时保留的 declined proposal。
- `archived`：冻结、未来价值较低的 implemented decision；永远不是 current authority。

每份 note 使用以下 closed set 中的一个 class：

- `feature`：新的 user-facing 或 agent-facing capability。
- `bug-fix`：纠正 defect 或 gap。
- `simplification`：在不增加 capability 的情况下移除内容。
- `architecture`：shipped source 中的 structure、ownership 或 runtime relationship。
- `process`：code 周边的 tooling、policy 或 workflow。
- `testing`：test infrastructure 或 strategy。

`refactor` 不是 class；应说明 change 的原因。Lifecycle/class tree 和 repository search
就是 inventory；不要创建 centralized index。Filename date 是 topic 首次提出的日期。
Cross-reference 使用 relative Markdown link，使 lifecycle move 可以修复。

## Before Creating A Note

增加文件前，搜索 active Agent Note 中相同的 decision、mechanism、ownership boundary
或 rejected alternative。对关系进行分类：

- **Duplicate：** 更新现有 owner；不要创建另一份 note。
- **Extension：** 当 decision 和 rationale 不变时更新现有 owner；只有真正独立的
  decision 才创建 linked note。
- **Partial supersession：** 创建新 owner，保持两份 note active，并交叉链接仍然存在
  的 responsibility。
- **Full supersession：** 创建新 owner，且只有在保存所有独有有用 proposition 后，
  才 consolidation 或 archive 旧 implemented note。
- **Independent：** 创建新 note，且仅在对 reader 有用时链接。

在同一个 coherent change 中处理已知 obsolete proposal 和 rejected note。绝不把旧
note 改写成相反 decision，也绝不让 Git history 成为有用 rationale 的唯一剩余副本。

## When A Note Is Required

对 behavior、architecture、shared contract、process 或 tooling、testing strategy、
configuration、durable 或 wire format、security rule、ownership，或其他未来 maintainer
可能合理重新审视的 decision 进行 non-trivial change 时，需要新增或更新 Agent Note。

不改变 behavior、structure、contract、process 或 rationale 的纯机械或局部 edit 可以
豁免。Task、issue、branch、pull request、queue、chat 或 agent loop 不能替代 owning
Agent Note，也不能授予实施权限。

## Lifecycle And File Format

每份 active note 都以下列内容开头：

```markdown
# Agent Note: <title>

Status: <status>
```

Lifecycle directory 和匹配的 `Status:` 行是唯一 canonical work state。根据所在位置，
status 必须是 `proposed`、`building`、`review`、`implemented` 或
`rejected — <short reason>`。

### Proposed

```markdown
## Problem
## Proposal
## Alternatives considered
## Acceptance criteria
## Risks
```

Proposed note 已经成形且可评审，但不授权实施。Problem 必须脱离 preferred solution
也能成立。Alternative 必须真实，绝不能为了满足格式而编造。

### Building

Building 保留 proposed structure，并使用 `Status: building`。把完整 triplet 从
proposed 移至 building，记录明确实施授权。Building 表示已授权且未完成；不表示
agent 或 worker 正在持续运行。

### Review

Review 保留 building structure，在 `## Risks` 后增加 `## Verification`，并使用
`Status: review`。只有 implementation 声称通过相称 evidence 满足全部 acceptance
criterion 时才移至 review。要求修改时，完整 triplet 返回 building。

### Implemented

```markdown
## Problem
## Decision
## Alternatives considered
## Consequences
## Verification
```

只有经过 Simon 验收且已交付的工作才从 review 移至 implemented。把 note 改写为现在时
现实：删除 proposal-era plan 和 acceptance checklist，记录 trade-off 获得和付出的
内容，并保留约束 decision 的 evidence。

当 path、symbol、default、mechanism 和其他事实 realization 移动时，在同一个 change
中保持更新。原地重写 stale fact；不要追加 chronological change log。这不是改写
decision 或 rationale 的许可。推翻 decision 必须创建新 Agent Note 并明确 supersession。

### Rejected

Rejected note 保留 proposal-time body，并使用：

```text
Status: rejected — <short reason>
```

把 rejected note 视为已经 settle 的 proposal，而不是放置新 decision 的地方。只在
rejected idea 仍有吸引力且 rationale 能防止 re-litigation 时保留；否则删除完整
triplet 并修复 inbound link。Rejected note 永远不 archive。

## Supersession And Consolidation

只有在没有任何 surviving code、configuration、schema、durable data、wire behavior、
migration、compatibility path、ownership rule、security condition 或有用 rationale
仍依赖 implemented note 时，它才 fully superseded。如果其他部分仍存在，移除一个
transport、default、implementation 或 presentation 只是 partial supersession。

Consolidation 或删除 fully superseded implemented note 前，在 current owner 中保留每项
独有内容：

- motivation 和 constraint；
- alternative 以及落选原因；
- consequence 和放弃的 capability；
- negative guarantee 或 security rule；
- required verification 和已注明的 coverage gap；
- reintroduction condition。

修复每个 inbound link，并同时删除完整 English、Chinese 和 sidecar triplet。Partial
supersession 永远不满足 consolidation 条件：保持两份 note active、事实最新并互相链接。

## Archiving

根据未来 decision value，而不是 age、length 或 target quota 对 note 进行分类。

- 当 implemented note 的 rationale、alternative、ownership boundary、negative
  guarantee、durable 或 wire semantic、security rule 或 reintroduction condition
  可能指导未来工作时，保持 active。
- 当 shipped decision 已完成且正文不太可能指导未来工作时，archive implemented note。
- 绝不 archive proposed、building、review 或 rejected note。

Archival 把完整 triplet 移至 `archived/<class>/`，保留 `Status: implemented`，在两个
语言文件的 status 正下方插入相同的 `Archived: YYYY-MM-DD` 行，重新记录 sidecar，
修复 active inbound link，并在 `agent_notes/archive-manifest.json` 中封存三个文件。
这些是唯一允许的 archival content change。

加入 seal 前运行：

```bash
node tools/governance/verify_agent_notes.mjs --write-archive-manifest
```

Write mode 先验证每个既有 seal，然后只加入新的有效 archived file。封存后，绝不编辑、
翻译、重排、移动或删除 archived file。Archived note 是 historical snapshot，不是
current authority；新 fact 和 decision 属于 active doc 或 note。

## Bilingual Contract

每份 Agent Note 是一个同等权威的 triplet：

```text
topic.md
topic.zh.md
topic.i18n.yaml
```

任意语言都可以先起草。两个 Markdown file 表达相同 decision，并保持 heading、list
shape、table、link 和 code block 一致。机器检查的 `# Agent Note:` 与 `Status:` token
保留英文。

编辑任意语言时，都要更新另一侧并重新记录 sidecar：

```bash
node tools/governance/verify_bilingual_docs.mjs --write <file>
```

无后缀 `.md` path 是 ecosystem default，不表示更高 authority。每次 lifecycle move
都包含三个文件、更新两侧 status line、重新记录 sidecar，并修复 inbound link。

## Validation

运行 repository 已记录的 gate，并运行：

```bash
node tools/governance/verify_agent_notes.mjs
node --test tools/governance/verify_agent_notes.test.mjs
node tools/governance/verify_bilingual_docs.mjs
git diff --check
```

Mechanical validation 无法证明 proposal 值得实施、alternative 真实、supersession
完整、acceptance evidence 足够，或 archive 不再具有未来 decision value。这些仍然是
semantic review duty。
