/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const LOCALES_DIR = path.join(ROOT, 'src', 'i18n', 'locales');
const SOURCE_ROOTS = [path.join(ROOT, 'src'), path.join(ROOT, 'App.tsx')];
const CODE_EXTENSIONS = new Set(['.ts', '.tsx']);
const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  '.github',
  'dist',
  'build',
  '.expo',
  'docs',
  'assets',
  'public',
]);

function flattenKeys(obj, prefix = '') {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return [];

  return Object.entries(obj).flatMap(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? flattenKeys(value, newKey)
      : newKey;
  });
}

function walkFiles(targetPath) {
  if (!fs.existsSync(targetPath)) return [];

  const stats = fs.statSync(targetPath);
  if (stats.isFile()) {
    return CODE_EXTENSIONS.has(path.extname(targetPath)) ? [targetPath] : [];
  }

  return fs.readdirSync(targetPath, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(targetPath, entry.name);
    if (entry.isDirectory() && !EXCLUDED_DIRS.has(entry.name)) {
      return walkFiles(fullPath);
    }
    return CODE_EXTENSIONS.has(path.extname(entry.name)) ? [fullPath] : [];
  });
}

function extractUsedKeys(code) {
  const regex = /(?:\b(?:i18n\s*\.\s*)?t\s*\(\s*|i18nKey\s*=\s*(?:\{\s*)?)(['"`])([^'"`]+?)\1/g;
  const used = new Set();

  for (const match of code.matchAll(regex)) {
    const key = match[2].trim();
    if (key && !key.includes('${')) used.add(key);
  }

  // More generically, match any string value that looks like a translation key (e.g., documents.*) in arrays or objects
  const genericKeyRegex = /['"]([a-zA-Z0-9_.]+\.[a-zA-Z0-9_.]+)['"]/g;
  for (const match of code.matchAll(genericKeyRegex)) {
    const key = match[1];
    // Only add if it looks like a translation key (e.g., has a dot and no spaces)
    if (key.includes('.') && !key.includes(' ')) {
      used.add(key);
    }
  }

  return used;
}

const PLURAL_SUFFIXES = ['_one', '_other', '_zero', '_two', '_few', '_many'];

function extractPluralBaseKeys(code) {
  const bases = new Set();

  const pluralRegex = /\bt\s*\(\s*(['"\`])([^'"\`]+)\1\s*,\s*\{[^}]*\bcount\b/g;
  for (const match of code.matchAll(pluralRegex)) {
    const key = match[2].trim();
    if (key && !key.includes('${')) bases.add(key);
  }

  return bases;
}

function extractPartialPrefixes(code) {
  const prefixes = new Set();

  // Template literal with dynamic segment: `prefix.${variable}`
  const templateRegex = /`([a-zA-Z0-9_.]+\.)(\$\{)/g;
  for (const match of code.matchAll(templateRegex)) {
    prefixes.add(match[1]);
  }

  // String concatenation with dynamic segment: 'prefix.' + variable
  const concatRegex = /(['"`])([a-zA-Z0-9_.]+\.)(\1)\s*\+/g;
  for (const match of code.matchAll(concatRegex)) {
    prefixes.add(match[2]);
  }

  return prefixes;
}

function main() {
  if (!fs.existsSync(LOCALES_DIR)) {
    console.error(`Locales directory not found: ${LOCALES_DIR}`);
    process.exit(1);
  }

  const localeFiles = fs
    .readdirSync(LOCALES_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort();
  if (!localeFiles.length) {
    console.error(`No locale JSON files found in: ${LOCALES_DIR}`);
    process.exit(1);
  }

  const sourceFiles = SOURCE_ROOTS.flatMap(walkFiles);
  const fileContents = sourceFiles.map((filePath) => fs.readFileSync(filePath, 'utf8'));
  const usedKeys = new Set(fileContents.flatMap((code) => [...extractUsedKeys(code)]));
  const partialPrefixes = new Set(
    fileContents.flatMap((code) => [...extractPartialPrefixes(code)]),
  );
  const pluralBaseKeys = new Set(
    fileContents.flatMap((code) => [...extractPluralBaseKeys(code)]),
  );

  console.log(`Scanned ${sourceFiles.length} source files.`);
  console.log(`Detected ${usedKeys.size} used translation keys in code.`);
  console.log(`Detected ${partialPrefixes.size} partial key prefixes (dynamic usage).`);
  console.log(`Detected ${pluralBaseKeys.size} plural base keys (count-based pluralization).\n`);

  let hasUnused = false;

  for (const localeFile of localeFiles) {
    const localeName = path.basename(localeFile, '.json');
    const localeJson = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, localeFile), 'utf8'));
    const allKeys = flattenKeys(localeJson).sort();
    const notUsed = allKeys.filter((key) => !usedKeys.has(key));
    const warnings = notUsed.filter((key) => {
      if ([...partialPrefixes].some((prefix) => key.startsWith(prefix))) return true;
      const pluralSuffix = PLURAL_SUFFIXES.find((s) => key.endsWith(s));
      if (pluralSuffix) {
        const base = key.slice(0, key.length - pluralSuffix.length);
        if (pluralBaseKeys.has(base)) return true;
      }
      return false;
    });
    const warningSet = new Set(warnings);
    const unused = notUsed.filter((key) => !warningSet.has(key));

    console.log(`Locale: ${localeName}`);
    console.log(`  Total keys: ${allKeys.length}`);
    console.log(`  Used keys:  ${allKeys.length - notUsed.length}`);
    console.log(`  Partial:    ${warnings.length} (dynamic keys)`);
    console.log(`  Unused:     ${unused.length}`);

    if (unused.length) {
      hasUnused = true;
      unused.forEach((key) => console.log(`    - ${key}`));
    }
    console.log('');
  }

  if (hasUnused) process.exitCode = 2;
}

main();
