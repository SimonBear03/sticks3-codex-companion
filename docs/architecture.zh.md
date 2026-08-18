# 架构

[English](architecture.md) | 中文

本文档负责当前系统边界，并路由到详细权威。`README.md` 负责产品与设置快照，`planning/current-state.md` 负责实时实现交接，`docs/protocol.md` 负责线上协议约定。

## 产品边界

M5Stack Codex Companion 是面向 Mac 上 Codex 的只读紧凑活动显示器。本仓库负责两个 ESP32-S3 固件目标、Python 桥接、原生 macOS 菜单栏控制器、桥接监督与打包脚本、设备协议及辅助文档。

产品不负责 Codex Desktop 或 App Server、macOS 安全策略、蓝牙硬件、M5Stack 板级支持或 OpenAI 协议保证。没有规范的 attach 或 control endpoint 时，它无法控制已打开的 Codex Desktop 线程。

## Bridge-first 形态

```text
Codex Desktop rollout logs       Codex App Server
             \                      /
              \                    /
               Python bridge and canonical activity mapping
                              |
                    authenticated JSONL over BLE
                              |
                 StickS3 or Cardputer ADV firmware

native macOS menu app -> bridge supervisor -> Python bridge
```

设备协议刻意保持小型和本地；它不是官方 OpenAI BLE 协议。两种输入模式都映射到同一规范活动形态。`desktop-observer` 是当前只读产品路径。`app-server` 保留为协议验证路径，并不表示设备端提供批准或选择控件。

## 组件所有者

- `src/main.cpp` 负责 StickS3 与 Cardputer ADV 固件、显示状态、输入、BLE 传输、配对/认证、设置、遥测与电源行为。
- `platformio.ini` 负责两个固件构建环境和共享的固定平台约定。
- `bridge/sticks3_bridge/` 负责 rollout/App Server 观察、语义规范化、隐私过滤、配对状态、BLE 客户端与 CLI 行为。
- `docs/protocol.md` 负责 UUID、JSONL 消息、认证、兼容字段、detail modes、ack 与限额映射。
- `scripts/sticks3-macos-bridge` 负责它启动的桥接进程和本地运行状态；不得终止无关 observer。
- `macos/` 与 `scripts/build-macos-companion` 负责原生控制器及其本地开发打包路径。

## 信任与隐私边界

设备发现使用受支持的 BLE 名称前缀，但私有 Codex 数据只会在每连接 HMAC 认证后发送给明确配对的设备。配对密钥与本地设备设置保留在机器本地或设备存储中，绝不进入 Git。

Detail modes 在传输前缩小输出信息。`Full` 可以携带消息活动，`Status` 抑制正文，`Usage` 只发送通用状态与用量。固件兼容字段不授权平行的未过滤路径。

## 状态与兼容

Python 桥接把数据源专用事件映射为主要语义状态 `codex_activity/v1`。旧计数器与消息字段保留为有界兼容输入。固件保持固定容量的接收与活动缓冲区，并根据屏幕几何重新排版缓存原始消息；它不会把畸形传输片段当作语义应用故障。

两个目标通过明确的 board build flags 共享一个固件源。StickS3 是经过真机验证的主要目标。Cardputer ADV 目前只有编译验证；在设备上完成当前交接清单前，不得描述为已通过硬件验证。

## 运行时与分发

虚拟环境、PlatformIO 状态、配对数据、日志、PID、生成的 app bundles、LaunchAgents 与已安装应用都是 Git 之外的运行时产物。原生应用和生成的蓝牙 helper 属于本地开发安装形态；签名/公证后的公开分发继续由 `docs/distribution.md` 约束。

## 验证边界

Python 单元测试覆盖协议与桥接行为。PlatformIO 构建覆盖每个所选板卡的固件编译。macOS helper 构建与运行时行为需要 Mac。BLE、显示、控制、音频、电源、遥测、刷写与热表现需要对应真机。

治理验证器证明 Agent Note 形态、双语结构一致性与 sidecar 时效性。它们不会把 Linux 构建转化为 Mac 或硬件证据，历史验证也不是新变更的最新证据。
