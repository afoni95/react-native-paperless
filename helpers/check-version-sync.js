/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};
const ok = (s) => `${c.green}${c.bold}${s}${c.reset}`;
const err = (s) => `${c.red}${c.bold}${s}${c.reset}`;
const dim = (s) => `${c.dim}${s}${c.reset}`;
const highlight = (s) => `${c.cyan}${s}${c.reset}`;

// ─── Extractors ──────────────────────────────────────────────────────────────

function readPackageJson() {
  const raw = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8');
  const json = JSON.parse(raw);
  return { version: json.version };
}

function readAppJson() {
  const raw = fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8');
  const json = JSON.parse(raw);
  return {
    version: json.expo?.version,
    versionCode: json.expo?.android?.versionCode,
  };
}

function readBuildGradle() {
  const raw = fs.readFileSync(path.join(ROOT, 'android', 'app', 'build.gradle'), 'utf8');
  const nameMatch = raw.match(/^\s*versionName\s+"([^"]+)"/m);
  const codeMatch = raw.match(/^\s*versionCode\s+(\d+)/m);
  return {
    version: nameMatch?.[1] ?? null,
    versionCode: codeMatch ? parseInt(codeMatch[1], 10) : null,
  };
}

function readFdroidMetadata() {
  const filePath = path.join(ROOT, 'scripts', 'fdroid-metadata.yml');
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf8');

  const currentVersionMatch = raw.match(/^CurrentVersion:\s*(.+)/m);
  const currentVersionCodeMatch = raw.match(/^CurrentVersionCode:\s*(\d+)/m);

  return {
    version: currentVersionMatch?.[1]?.trim() ?? null,
    versionCode: currentVersionCodeMatch ? parseInt(currentVersionCodeMatch[1], 10) : null,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const sources = [
  { label: 'package.json', ...readPackageJson() },
  { label: 'app.json (expo)', ...readAppJson() },
  { label: 'android/app/build.gradle', ...readBuildGradle() },
];

const fdroid = readFdroidMetadata();
if (fdroid) {
  sources.push({ label: 'scripts/fdroid-metadata.yml', ...fdroid });
}

console.log(`${c.bold}Checking version consistency across files:${c.reset}\n`);

const colWidth = Math.max(...sources.map((s) => s.label.length)) + 2;
for (const s of sources) {
  console.log(
    `  ${highlight(s.label.padEnd(colWidth))} ${dim('version=')}${String(s.version).padEnd(10)}  ${dim('versionCode=')}${s.versionCode}`,
  );
}
console.log('');

let failed = false;

// Check semver string
const versions = sources.map((s) => s.version).filter(Boolean);
const uniqueVersions = new Set(versions);
if (uniqueVersions.size > 1) {
  console.error(err('ERROR: version strings are not in sync:'));
  for (const s of sources) {
    if (s.version != null) {
      console.error(`  ${s.label}: ${c.red}${s.version}${c.reset}`);
    }
  }
  failed = true;
} else {
  console.log(`${ok('✓')}  version = ${highlight([...uniqueVersions][0])}`);
}

// Check version code (only files that carry one)
const withCode = sources.filter((s) => s.versionCode != null);
const uniqueCodes = new Set(withCode.map((s) => s.versionCode));
if (uniqueCodes.size > 1) {
  console.error(err('\nERROR: versionCode values are not in sync:'));
  for (const s of withCode) {
    console.error(`  ${s.label}: ${c.red}${s.versionCode}${c.reset}`);
  }
  failed = true;
} else if (withCode.length > 0) {
  console.log(`${ok('✓')}  versionCode = ${highlight([...uniqueCodes][0])}`);
}

if (failed) {
  console.error(
    err('\nVersion sync check FAILED. Ensure all files use the same version and versionCode.'),
  );
  process.exit(1);
} else {
  console.log(`\n${ok('All version numbers are in sync.')}`);
}
