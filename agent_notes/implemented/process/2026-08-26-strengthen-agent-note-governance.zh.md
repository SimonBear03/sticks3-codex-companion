# Agent Note：加强 Agent Note 治理

Status: implemented

[English](2026-08-26-strengthen-agent-note-governance.md) | 中文

## Problem

仓库的可移植 Agent Note 指南保留了 Simon 的提案、授权、评审与接受门槛，但对取代关系、implemented 记录维护、整合和归档选择解释不足。归档记录虽被称为冻结，却没有机械封存。

## Decision

保留六阶段生命周期，并增加四项有边界的保障：

- 新建记录前搜索范围内既有记录，并判断为延伸、部分或完整取代，或独立决策；
- 保持 implemented 记录中的实现事实为最新，但不反转其决策或理由；
- 按未来决策价值保留或归档，绝不使用数量配额；
- 用只追加的 SHA-256 manifest 封存双语三文件组，拒绝修改、删除、不完整三文件组和未经评审的新增。

完整协议保留在本地 `agent_notes/README.md`，`AGENTS.md` 只保留简洁路由规则。采用 workspace 的可移植模板，同时由本仓库独立拥有复制后的治理文件。

## Alternatives considered

- 原样采用 DeepSeek Harness：拒绝，因为它较短的生命周期无法表达 Simon 明确的实施授权和接受门槛。
- 把完整协议放入 `AGENTS.md`：拒绝，因为这会让启动指令嘈杂，并重复本地生命周期指南。
- 只靠书面政策保证归档不可变：拒绝，因为重新生成 sidecar 后，目前仍可在不被发现的情况下修改归档记录。

## Consequences

- 本地双语指南覆盖取代关系、当前性、整合、未来价值分类和归档规则。
- 仓库具有空的版本化 archive manifest，以及聚焦测试能够证明首次封存、拒绝修改和删除、只追加增长的验证器。
- `AGENTS.md` 引导 agent 使用新保障，但不重复完整指南。
- 本地治理检查和 `git diff --check` 通过。

### Trade-offs and residual risks

- 哈希封存有意阻止随意修复归档。
- 取代关系和未来价值仍需语义判断；机械检查无法证明已经找到所有相关既有决策。
- 如果扩展到持久决策、生命周期、取代关系和归档之外，可移植指南可能变成仪式负担。

## Verification

- `node tools/governance/verify_agent_notes.mjs`
- `node --test tools/governance/verify_agent_notes.test.mjs`
- `node tools/governance/verify_bilingual_docs.mjs`
- `git diff --check`
