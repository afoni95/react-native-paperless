const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const LOCALES_DIR = path.join(ROOT, 'src', 'i18n', 'locales');
const SOURCE_ROOTS = [path.join(ROOT, 'src'), path.join(ROOT, 'App.tsx')];
const CODE_EXTENSIONS = new Set(['.ts', '.tsx']);
const EXCLUDED_DIRS = new Set(['node_modules', '.git', '.github', 'dist', 'build', '.expo', 'docs', 'assets', 'public']);

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

  return fs.readdirSync(targetPath, { withFileTypes: true }).flatMap(entry => {
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

  return used;
}

function main() {
  if (!fs.existsSync(LOCALES_DIR)) {
    console.error(`Locales directory not found: ${LOCALES_DIR}`);
    process.exit(1);
  }

  const localeFiles = fs.readdirSync(LOCALES_DIR).filter(name => name.endsWith('.json')).sort();
  if (!localeFiles.length) {
    console.error(`No locale JSON files found in: ${LOCALES_DIR}`);
    process.exit(1);
  }

  const sourceFiles = SOURCE_ROOTS.flatMap(walkFiles);
  const usedKeys = new Set(
    sourceFiles.flatMap(filePath => 
      [...extractUsedKeys(fs.readFileSync(filePath, 'utf8'))]
    )
  );

  console.log(`Scanned ${sourceFiles.length} source files.`);
  console.log(`Detected ${usedKeys.size} used translation keys in code.\n`);

  let hasUnused = false;

  for (const localeFile of localeFiles) {
    const localeName = path.basename(localeFile, '.json');
    const localeJson = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, localeFile), 'utf8'));
    const allKeys = flattenKeys(localeJson).sort();
    const unused = allKeys.filter(key => !usedKeys.has(key));

    console.log(`Locale: ${localeName}`);
    console.log(`  Total keys: ${allKeys.length}`);
    console.log(`  Used keys:  ${allKeys.length - unused.length}`);
    console.log(`  Unused:     ${unused.length}`);

    if (unused.length) {
      hasUnused = true;
      unused.forEach(key => console.log(`    - ${key}`));
    }
    console.log('');
  }

  if (hasUnused) process.exitCode = 2;
}

main();
