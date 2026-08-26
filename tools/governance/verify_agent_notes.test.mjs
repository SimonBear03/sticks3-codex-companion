#!/usr/bin/env node

import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./verify_agent_notes.mjs', import.meta.url));

function run(root, ...args) {
  return spawnSync(process.execPath, [path.join(root, 'tools/governance/verify_agent_notes.mjs'), ...args], { cwd: root, encoding: 'utf8' });
}

async function writeTriplet(root, slug, body = 'Decision record.\n') {
  const directory = path.join(root, 'agent_notes/archived/process');
  await mkdir(directory, { recursive: true });
  const header = '# Agent Note: Archive Test\n\nStatus: implemented\nArchived: 2026-08-26\n\n';
  await writeFile(path.join(directory, `${slug}.md`), `${header}${body}`);
  await writeFile(path.join(directory, `${slug}.zh.md`), `${header}${body}`);
  await writeFile(path.join(directory, `${slug}.i18n.yaml`), 'version: 1\n');
}

test('archive manifest is append-only and detects mutation or deletion', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'agent-note-validator-'));
  try {
    await mkdir(path.join(root, 'tools/governance'), { recursive: true });
    await cp(SCRIPT, path.join(root, 'tools/governance/verify_agent_notes.mjs'));
    await mkdir(path.join(root, 'agent_notes'), { recursive: true });
    await writeFile(path.join(root, 'agent_notes/archive-manifest.json'), '{\n  "version": 1,\n  "entries": {}\n}\n');
    assert.equal(run(root).status, 0);
    const orphanDirectory = path.join(root, 'agent_notes/archived/process');
    await mkdir(orphanDirectory, { recursive: true });
    const orphan = path.join(orphanDirectory, '2026-08-26-orphan.zh.md');
    await writeFile(orphan, '# Agent Note: Orphan\n\nStatus: implemented\nArchived: 2026-08-26\n');
    assert.notEqual(run(root).status, 0);
    assert.notEqual(run(root, '--write-archive-manifest').status, 0);
    await rm(orphan);
    const first = '2026-08-26-first';
    await writeTriplet(root, first);
    assert.notEqual(run(root).status, 0);
    assert.equal(run(root, '--write-archive-manifest').status, 0);
    assert.equal(run(root).status, 0);
    const manifestPath = path.join(root, 'agent_notes/archive-manifest.json');
    const firstManifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    assert.equal(Object.keys(firstManifest.entries).length, 3);
    const english = path.join(root, `agent_notes/archived/process/${first}.md`);
    await writeFile(english, `${await readFile(english, 'utf8')}changed\n`);
    assert.notEqual(run(root).status, 0);
    assert.notEqual(run(root, '--write-archive-manifest').status, 0);
    await writeTriplet(root, first);
    assert.equal(run(root).status, 0);
    await rm(path.join(root, `agent_notes/archived/process/${first}.zh.md`));
    assert.notEqual(run(root).status, 0);
    assert.notEqual(run(root, '--write-archive-manifest').status, 0);
    await writeTriplet(root, first);
    await writeTriplet(root, '2026-08-26-second');
    assert.equal(run(root, '--write-archive-manifest').status, 0);
    const secondManifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    assert.equal(Object.keys(secondManifest.entries).length, 6);
    for (const [key, value] of Object.entries(firstManifest.entries)) assert.equal(secondManifest.entries[key], value);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
