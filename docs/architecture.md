# Architecture

English | [中文](architecture.zh.md)

This document owns the current system boundary and routes to detailed
authorities. `README.md` owns the product and setup snapshot,
`planning/current-state.md` owns the live implementation handoff, and
`docs/protocol.md` owns the on-wire contract.

## Product boundary

M5Stack Codex Companion is a read-only compact activity display for Codex on a
Mac. This repository owns two ESP32-S3 firmware targets, a Python bridge, a
native macOS menu-bar controller, bridge-supervision and packaging scripts, the
device protocol, and supporting documentation.

The product does not own Codex Desktop or App Server, macOS security policy,
Bluetooth hardware, M5Stack board support, or OpenAI protocol guarantees. It
cannot control an already-open Codex Desktop thread without a documented attach
or control endpoint.

## Bridge-first shape

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

The device protocol is intentionally small and local; it is not an official
OpenAI BLE protocol. Both input modes map into the same canonical activity
shape. `desktop-observer` is the active read-only product path. `app-server`
remains a protocol-validation path and does not imply device-side approval or
choice controls.

## Component owners

- `src/main.cpp` owns StickS3 and Cardputer ADV firmware, display state, input,
  BLE transport, pairing/auth, settings, telemetry, and power behavior.
- `platformio.ini` owns the two firmware build environments and shared pinned
  platform contract.
- `bridge/sticks3_bridge/` owns rollout/App Server observation, semantic
  normalization, privacy filtering, pairing state, BLE clients, and CLI behavior.
- `docs/protocol.md` owns UUIDs, JSONL messages, authentication, compatibility
  fields, detail modes, acknowledgements, and rate-limit mappings.
- `scripts/sticks3-macos-bridge` owns the bridge process it starts and its local
  runtime status; it must not kill unrelated observers.
- `macos/` and `scripts/build-macos-companion` own the native controller and its
  local developer packaging path.

## Trust and privacy boundary

Device discovery uses supported BLE name prefixes, but private Codex data is
sent only to explicitly paired devices after per-connection HMAC authentication.
Pairing secrets and local device settings remain in machine-local or device
storage, never Git.

Detail modes narrow outbound information before transport. `Full` may carry
message activity, `Status` suppresses body text, and `Usage` sends only generic
state and usage. Firmware compatibility fields do not authorize parallel
unfiltered paths.

## State and compatibility

The Python bridge maps source-specific events into `codex_activity/v1`, which is
the primary semantic state. Legacy counters and message fields remain bounded
compatibility inputs. The firmware keeps fixed-capacity receive and activity
buffers and reflows cached raw messages for screen geometry; it does not treat
malformed transport fragments as semantic application failures.

Both targets share one firmware source with explicit board build flags. StickS3
is the physically validated primary target. Cardputer ADV currently has compile
validation and must not be described as hardware-validated until the current
handoff checklist is performed on the device.

## Runtime and distribution

Virtual environments, PlatformIO state, pairing data, logs, PIDs, generated app
bundles, LaunchAgents, and installed applications are runtime artifacts outside
Git. The native app and generated Bluetooth helper are a local developer install
shape; signed/notarized public distribution remains governed by
`docs/distribution.md`.

## Validation boundary

Python unit tests cover protocol and bridge behavior. PlatformIO builds cover
firmware compilation for each selected board. macOS helper builds and runtime
behavior require a Mac. BLE, display, controls, audio, power, telemetry,
flashing, and thermal behavior require the relevant physical device.

Governance validators prove Agent Note shape, bilingual structural parity, and
sidecar freshness. They do not convert a Linux build into Mac or hardware
evidence, and historical validation is not fresh evidence for a new change.
