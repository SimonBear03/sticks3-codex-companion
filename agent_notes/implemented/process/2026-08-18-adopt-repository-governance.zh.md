# Agent Note: 采用仓库治理规范

Status: implemented

[English](2026-08-18-adopt-repository-governance.md) | 中文

## Problem

本仓库已有详细的当前状态、协议、分发、硬件与桥接文档，但此前缺少用于持久决策的可移植 Agent Notes 生命周期、简洁的双语架构所有者，以及本地治理检查。现有良好的证据边界依赖贡献者自行找到并维护多份独立文档。

## Decision

本仓库在本地携带通用治理协议：可见、双语的 Agent Notes 生命周期与本地验证器；一份路由到现有细节的简洁双语架构地图；以及面向轻量规格、基于证据的简化、文档所有权、变更专用验证与条件式复盘的冷启动规则。README、`planning/current-state.md` 以及协议/分发/硬件文档保留其现有当前状态所有权。

## Alternatives considered

- 让 `planning/current-state.md` 同时承担当前状态与永久依据。这会把实时交接文档变成只能追加的决策日志。
- 把协议和设备事实复制进 Agent Notes。现有当前文档已经拥有这些事实，应继续作为唯一权威。
- 只依赖工作区治理。当仓库在 Mac 或其他机器上被独立打开时，这套规则会失效。

## Consequences

Agent 会先获得小型系统地图，再加载详细实时交接、线上协议、分发计划或硬件参考。持久依据不再需要累积在当前状态文档中。证据继续严格限定范围：Linux 上的 Python 与固件检查并不表示 macOS helper、BLE、显示、控制、音频、电源、刷写、热表现或其他真机验证完成。本次采用不改变固件、协议、桥接、macOS、配对、隐私或硬件行为。

## Verification

- `PYTHONPATH=bridge python3 -m unittest discover -s tests` 的 94 项测试全部通过。
- `.venv/bin/pio run -e sticks3` 顺序执行并通过；RAM 为 37,840 / 327,680 字节，闪存为 1,101,757 / 3,342,336 字节。
- `.venv/bin/pio run -e cardputer_adv` 顺序执行并通过；RAM 为 38,704 / 327,680 字节，闪存为 1,056,765 / 3,342,336 字节。
- 最终固件证据来自顺序构建。更早的并行调用因两个目标争用生成的 PlatformIO 依赖/构建状态而被舍弃。
- `node tools/governance/verify_agent_notes.mjs` 通过。
- `node tools/governance/verify_bilingual_docs.mjs` 通过。
- `git diff --check` 通过。
- 未运行 macOS helper 与真机检查，也不声称这些验证已完成。
