'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const BOARDLAND_JS = path.join(ROOT, 'js', 'boardland-family.js');
const VOICE_DIR = path.join(ROOT, 'assets', 'voice', 'games');
const MANIFEST_FILES = [
  path.join(ROOT, 'voice_manifest.json'),
  path.join(VOICE_DIR, 'voice_manifest.json'),
  path.join(VOICE_DIR, '_voice_manifest_boardland_add.json')
];

function boardVoiceKeyToFileName(id) {
  return String(id || '')
    .replace(/^board\./, 'board-')
    .replace(/\.([a-z])/g, (_, ch) => `-${ch}`)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase() + '.mp3';
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return { exists: false, voices: {}, structure: 'missing' };
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  const hasVoices = parsed && typeof parsed === 'object' && parsed.voices && typeof parsed.voices === 'object';
  return {
    exists: true,
    voices: hasVoices ? parsed.voices : parsed,
    structure: hasVoices ? 'voices' : 'flat'
  };
}

function loadEventCards() {
  const source = fs.readFileSync(BOARDLAND_JS, 'utf8');
  const match = source.match(/const EVENT_CARDS = (\[[\s\S]*?\]);/);

  if (!match) {
    throw new Error('EVENT_CARDS array not found in js/boardland-family.js');
  }

  const sandbox = {};
  return vm.runInNewContext(match[1], sandbox, { filename: 'boardland-family.js' });
}

function normalizePathForCompare(value) {
  return String(value || '').replace(/\\/g, '/').trim();
}

function main() {
  const eventCards = loadEventCards();
  const manifests = MANIFEST_FILES.map(filePath => ({
    filePath,
    ...readJsonIfExists(filePath)
  }));

  let hasIssue = false;

  eventCards.forEach(card => {
    const expectedFile = boardVoiceKeyToFileName(card.voiceId);
    const filePath = path.join(VOICE_DIR, expectedFile);
    const fileExists = fs.existsSync(filePath);
    const expectedManifestPath = `./assets/voice/games/${expectedFile}`;

    const manifestIssues = manifests
      .filter(manifest => manifest.exists)
      .map(manifest => {
        const actual = manifest.voices[card.voiceId];
        if (!actual) return path.relative(ROOT, manifest.filePath).replace(/\\/g, '/');
        if (normalizePathForCompare(actual) !== expectedManifestPath) {
          return path.relative(ROOT, manifest.filePath).replace(/\\/g, '/');
        }
        return null;
      })
      .filter(Boolean);

    const statuses = [];
    if (!fileExists) statuses.push('MISSING_FILE');
    if (manifestIssues.length) statuses.push('MISSING_MANIFEST');
    if (!statuses.length) statuses.push('OK');
    if (statuses[0] !== 'OK') hasIssue = true;

    const detail = manifestIssues.length ? ` | manifests: ${manifestIssues.join(', ')}` : '';
    console.log(`[${statuses.join('+')}] ${card.id} | ${card.title} | ${card.voiceId} | ${expectedFile}${detail}`);
  });

  if (hasIssue) {
    process.exitCode = 1;
  }
}

main();
