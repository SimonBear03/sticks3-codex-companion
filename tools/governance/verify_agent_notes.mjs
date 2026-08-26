#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const NOTES = path.resolve(ROOT, 'agent_notes');
const MANIFEST = path.join(NOTES, 'archive-manifest.json');
const WRITE_MANIFEST = process.argv.includes('--write-archive-manifest');
const UNKNOWN_ARGS = process.argv.slice(2).filter((arg) => arg !== '--write-archive-manifest');
const ACTIVE_LIFECYCLES = new Set(['proposed', 'building', 'review', 'implemented', 'rejected']);
const CLASSES = new Set(['feature', 'bug-fix', 'simplification', 'architecture', 'process', 'testing']);
const REQUIRED = {
  proposed: ['Problem', 'Proposal', 'Alternatives considered', 'Acceptance criteria', 'Risks'],
  building: ['Problem', 'Proposal', 'Alternatives considered', 'Acceptance criteria', 'Risks'],
  review: ['Problem', 'Proposal', 'Alternatives considered', 'Acceptance criteria', 'Risks', 'Verification'],
  implemented: ['Problem', 'Decision', 'Alternatives considered', 'Consequences', 'Verification'],
  rejected: ['Problem', 'Proposal', 'Alternatives considered'],
};

async function walk(directory) {
  const found = [];
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return found;
    throw error;
  }
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...(await walk(target)));
    else found.push(target);
  }
  return found;
}

function statusOf(markdown) {
  return markdown.match(/^Status:\s*(.+)$/mu)?.[1]?.trim() ?? null;
}

function archivedOn(markdown) {
  return markdown.match(/^Archived:\s*(\d{4}-\d{2}-\d{2})$/mu)?.[1] ?? null;
}

function headingsOf(markdown) {
  return [...markdown.matchAll(/^##\s+(.+)$/gmu)].map((match) => match[1].trim());
}

function missingHeadings(headings, required) {
  return required.filter((heading) => !headings.includes(heading));
}

function isOrdered(headings, required) {
  let previous = -1;
  for (const heading of required) {
    const index = headings.indexOf(heading);
    if (index <= previous) return false;
    previous = index;
  }
  return true;
}

function digest(content) {
  return createHash('sha256').update(content).digest('hex');
}

async function checkActive(file, relative) {
  const errors = [];
  const parts = relative.split(path.sep);
  const [lifecycle, noteClass, filename] = parts;
  if (parts.length !== 3) errors.push('active note path must be lifecycle/class/file');
  if (!ACTIVE_LIFECYCLES.has(lifecycle)) errors.push(`invalid lifecycle ${lifecycle}`);
  if (!CLASSES.has(noteClass)) errors.push(`invalid class ${noteClass}`);
  if (!/^\d{4}-\d{2}-\d{2}-.+\.md$/u.test(filename ?? '')) errors.push('filename must start with YYYY-MM-DD');
  const markdown = await readFile(file, 'utf8');
  if (!/^# Agent Note: .+\n\nStatus: .+\n/mu.test(markdown.slice(0, 300))) errors.push('invalid Agent Note header block');
  const status = statusOf(markdown);
  if (lifecycle === 'rejected') {
    if (!status?.startsWith('rejected — ')) errors.push('rejected status must include one-line reason');
  } else if (status !== lifecycle) errors.push(`status must be ${lifecycle}`);
  const headings = headingsOf(markdown);
  const required = REQUIRED[lifecycle] ?? [];
  const missing = missingHeadings(headings, required);
  for (const heading of missing) errors.push(`missing section ## ${heading}`);
  if (missing.length === 0 && !isOrdered(headings, required)) errors.push('required sections are out of order');
  if (lifecycle === 'implemented') {
    for (const forbidden of ['Proposal', 'Plan', 'Migration plan', 'Acceptance criteria', 'Risks']) {
      if (headings.includes(forbidden)) errors.push(`implemented note contains proposal-era section ## ${forbidden}`);
    }
  }
  return errors;
}

async function checkArchived(file, relative) {
  const errors = [];
  const parts = relative.split(path.sep);
  const [, noteClass, filename] = parts;
  if (parts.length !== 3) errors.push('archived note path must be archived/class/file');
  if (!CLASSES.has(noteClass)) errors.push(`invalid archived class ${noteClass}`);
  if (!/^\d{4}-\d{2}-\d{2}-.+\.md$/u.test(filename ?? '')) errors.push('filename must start with YYYY-MM-DD');
  const markdown = await readFile(file, 'utf8');
  if (!/^# Agent Note: .+\n\nStatus: implemented\nArchived: \d{4}-\d{2}-\d{2}\n/mu.test(markdown.slice(0, 300))) {
    errors.push('archived header must contain Status: implemented followed by Archived: YYYY-MM-DD');
  }
  return errors;
}

async function readManifest() {
  try {
    const parsed = JSON.parse(await readFile(MANIFEST, 'utf8'));
    if (parsed?.version !== 1 || !parsed.entries || Array.isArray(parsed.entries) || typeof parsed.entries !== 'object') {
      throw new Error('expected { "version": 1, "entries": {} }');
    }
    for (const [key, value] of Object.entries(parsed.entries)) {
      if (!key.startsWith('archived/') || !/^[a-f0-9]{64}$/u.test(value)) throw new Error(`invalid entry ${key}`);
    }
    return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error('agent_notes/archive-manifest.json is missing');
    throw new Error(`invalid archive manifest: ${error.message}`);
  }
}

if (UNKNOWN_ARGS.length > 0) {
  console.error(`unknown argument: ${UNKNOWN_ARGS.join(' ')}`);
  process.exit(2);
}

const files = await walk(NOTES);
const present = new Set(files);
const englishNotes = files.filter((file) => file.endsWith('.md') && !file.endsWith('.zh.md') && path.basename(file) !== 'README.md');
const archiveFiles = files.filter((file) => path.relative(NOTES, file).split(path.sep)[0] === 'archived').sort();
let failed = false;

for (const file of englishNotes.sort()) {
  const relative = path.relative(NOTES, file);
  const lifecycle = relative.split(path.sep)[0];
  const errors = lifecycle === 'archived' ? await checkArchived(file, relative) : await checkActive(file, relative);
  const stem = file.slice(0, -'.md'.length);
  if (!present.has(`${stem}.zh.md`)) errors.push('missing Chinese counterpart');
  else {
    const english = await readFile(file, 'utf8');
    const chinese = await readFile(`${stem}.zh.md`, 'utf8');
    if (statusOf(chinese) !== statusOf(english)) errors.push('Chinese status differs from English');
    if (lifecycle === 'archived' && archivedOn(chinese) !== archivedOn(english)) errors.push('Chinese Archived date differs from English');
  }
  if (!present.has(`${stem}.i18n.yaml`)) errors.push('missing i18n sidecar');
  if (errors.length > 0) {
    failed = true;
    for (const error of errors) console.error(`${relative}: ${error}`);
  } else console.log(`ok agent_notes/${relative}`);
}

for (const file of archiveFiles) {
  const relative = path.relative(NOTES, file);
  if (!/^archived[/\\](feature|bug-fix|simplification|architecture|process|testing)[/\\]\d{4}-\d{2}-\d{2}-.+\.(md|zh\.md|i18n\.yaml)$/u.test(relative)) {
    failed = true;
    console.error(`${relative}: unsupported file in sealed archive`);
  }
}

const archiveStems = new Set(archiveFiles.map((file) => file.replace(/(?:\.zh\.md|\.md|\.i18n\.yaml)$/u, '')));
for (const stem of archiveStems) {
  for (const suffix of ['.md', '.zh.md', '.i18n.yaml']) {
    if (!present.has(`${stem}${suffix}`)) {
      failed = true;
      console.error(`${path.relative(NOTES, stem)}: archived triplet is missing ${suffix}`);
    }
  }
}

let manifest;
try {
  manifest = await readManifest();
} catch (error) {
  failed = true;
  console.error(error.message);
}

if (manifest) {
  const current = new Map();
  for (const file of archiveFiles) current.set(path.relative(NOTES, file).split(path.sep).join('/'), digest(await readFile(file)));
  for (const [relative, expected] of Object.entries(manifest.entries)) {
    const actual = current.get(relative);
    if (!actual) {
      failed = true;
      console.error(`${relative}: sealed archive file is missing`);
    } else if (actual !== expected) {
      failed = true;
      console.error(`${relative}: sealed archive file was modified`);
    }
  }
  const unsealed = [...current.keys()].filter((relative) => !(relative in manifest.entries));
  if (WRITE_MANIFEST && !failed) {
    for (const relative of unsealed) manifest.entries[relative] = current.get(relative);
    manifest.entries = Object.fromEntries(Object.entries(manifest.entries).sort(([left], [right]) => left.localeCompare(right)));
    await mkdir(path.dirname(MANIFEST), { recursive: true });
    await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(unsealed.length > 0 ? `sealed ${unsealed.length} archive file(s)` : 'ok archive manifest already current');
  } else {
    for (const relative of unsealed) {
      failed = true;
      console.error(`${relative}: archived file is not sealed; run with --write-archive-manifest after review`);
    }
  }
}

if (englishNotes.length === 0) console.log('ok no Agent Notes');
if (failed) process.exit(1);
