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
const warn = (s) => `${c.yellow}${s}${c.reset}`;
const dim = (s) => `${c.dim}${s}${c.reset}`;
const highlight = (s) => `${c.cyan}${s}${c.reset}`;
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
    console.error(err(`Locales directory not found: ${LOCALES_DIR}`));
    process.exit(1);
  }

  const localeFiles = fs
    .readdirSync(LOCALES_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort();
  if (!localeFiles.length) {
    console.error(err(`No locale JSON files found in: ${LOCALES_DIR}`));
    process.exit(1);
  }

  const sourceFiles = SOURCE_ROOTS.flatMap(walkFiles);
  const fileContents = sourceFiles.map((filePath) => fs.readFileSync(filePath, 'utf8'));
  const usedKeys = new Set(fileContents.flatMap((code) => [...extractUsedKeys(code)]));
  const partialPrefixes = new Set(
    fileContents.flatMap((code) => [...extractPartialPrefixes(code)]),
  );
  const pluralBaseKeys = new Set(fileContents.flatMap((code) => [...extractPluralBaseKeys(code)]));

  console.log(`${c.bold}Checking translation key usage:${c.reset}\n`);
  console.log(`  ${dim('Scanned')}          ${highlight(sourceFiles.length)} source files`);
  console.log(`  ${dim('Used keys')}         ${highlight(usedKeys.size)} translation keys in code`);
  console.log(
    `  ${dim('Partial prefixes')}  ${highlight(partialPrefixes.size)} dynamic key prefixes`,
  );
  console.log(
    `  ${dim('Plural base keys')} ${highlight(pluralBaseKeys.size)} count-based plural keys\n`,
  );

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

    console.log(`${c.bold}${c.cyan}Locale: ${localeName}${c.reset}`);
    console.log(`  ${dim('Total keys:')}  ${allKeys.length}`);
    console.log(`  ${dim('Used keys:')}   ${ok(allKeys.length - notUsed.length)}`);
    console.log(
      `  ${dim('Partial:')}     ${warnings.length > 0 ? warn(warnings.length) : warnings.length} ${dim('(dynamic keys)')}`,
    );
    console.log(
      `  ${dim('Unused:')}      ${unused.length > 0 ? err(unused.length) : ok(unused.length)}`,
    );

    if (unused.length) {
      hasUnused = true;
      unused.forEach((key) => console.log(`    ${c.red}- ${key}${c.reset}`));
    }
    console.log('');
  }

  if (hasUnused) {
    console.error(err('Some translation keys are unused. Consider removing them.'));
    process.exitCode = 2;
  } else {
    console.log(ok('All translation keys are in use.'));
  }
}

main();
