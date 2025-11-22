const fs = require('fs');
const path = require('path');

const localesDir = './locales';

// Get all locale files (exclude config and utility files)
const localeFiles = fs.readdirSync(localesDir)
  .filter(file => file.endsWith('.ts') && !['server.ts', 'client.ts', 'config.ts', 'languages.ts'].includes(file))
  .sort();

console.log(`Found ${localeFiles.length} locale files\n`);

// Function to extract all keys and their values from a locale file
function extractKeysAndValues(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keysAndValues = {};

  // Match all quoted keys and their values
  // Uses backreferences to ensure quotes match and handle escaped characters correctly
  // Group 1: Key quote (' or ")
  // Group 2: Key
  // Group 3: Value quote (' or ")
  // Group 4: Value content
  const keyValueRegex = /(['"])([^'"]+)\1\s*:\s*(['"])([^\\\3]*(\\.[^\\\3]*)*)\3,?/g;
  let match;

  while ((match = keyValueRegex.exec(content)) !== null) {
    keysAndValues[match[2]] = match[4];
  }

  return keysAndValues;
}

// Function to extract just keys from a locale file (anchored to start of line)
function extractKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys = [];

  const keyRegex = /^\s*['"]([^'"]+)['"]\s*:/gm;
  let match;

  while ((match = keyRegex.exec(content)) !== null) {
    keys.push(match[1]);
  }

  return keys.sort();
}

// Read reference locales (French is highest quality, English is complete)
console.log('Reading reference locales...');
const frenchPath = path.join(localesDir, 'fr.ts');
const englishPath = path.join(localesDir, 'en.ts');

const frenchKeysAndValues = extractKeysAndValues(frenchPath);
const englishKeysAndValues = extractKeysAndValues(englishPath);

const frenchKeys = Object.keys(frenchKeysAndValues).sort();
const englishKeys = Object.keys(englishKeysAndValues).sort();

console.log(`French has ${frenchKeys.length} keys`);
console.log(`English has ${englishKeys.length} keys\n`);

// Use English as the complete reference (it should have all keys)
const referenceKeys = englishKeys;
const referenceValues = englishKeysAndValues;

console.log('='.repeat(80));
console.log('STEP 1: Adding missing keys with English placeholders');
console.log('='.repeat(80));
console.log();

let totalKeysAdded = 0;

for (const file of localeFiles) {
  const lang = file.replace('.ts', '');

  // Skip English (it's the reference)
  if (lang === 'en') {
    console.log(`${lang}: Skipping (reference locale)`);
    continue;
  }

  const filePath = path.join(localesDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const existingKeys = extractKeys(filePath);

  const missingKeys = referenceKeys.filter(key => !existingKeys.includes(key));

  if (missingKeys.length === 0) {
    console.log(`${lang}: ✓ Already synchronized (${existingKeys.length} keys)`);
    continue;
  }

  console.log(`${lang}: Adding ${missingKeys.length} missing keys...`);
  totalKeysAdded += missingKeys.length;

  // Read the file and add missing keys
  let newContent = content;

  // Remove the closing brace and any trailing content
  const closingBraceMatch = newContent.match(/}\s*(as const)?\s*;?\s*$/);
  if (closingBraceMatch) {
    newContent = newContent.substring(0, closingBraceMatch.index);
  }

  // Add missing keys
  for (const key of missingKeys) {
    let englishValue = referenceValues[key] || `[TODO: Translate ${key}]`;

    // Unescape quotes in the value if it was captured with escape sequences
    // Note: extractKeysAndValues keeps escapes in Group 4 (e.g. "Can\\'t").
    // But actually regex group 4 includes the backslash if it was there.
    // Wait, if source is `Can\'t`, group 4 has `Can\'t`.
    // When we write it out, we need to ensure it's valid JS string.
    // If we wrap in single quotes, we need to escape single quotes.
    // If the original value had escaped single quotes `\'`, we keep them.
    // If it had unescaped double quotes `"`, we don't need to escape them for single-quoted string.

    // However, `referenceValues` comes from `en.ts`.
    // If `en.ts` used double quotes `"Can't"`, the value captured is `Can't` (no backslash).
    // If we write it as `'Can't'`, it breaks.
    // So we MUST escape single quotes.

    // Add a comment indicating this needs translation
    newContent += `\n  // TODO: Translate from English\n`;
    // Use JSON.stringify to safely encode the value (handles quotes, backslashes, newlines, etc.)
    newContent += `  '${key}': ${JSON.stringify(englishValue)},\n`;
  }

  // Add closing brace
  newContent += '} as const;\n';

  // Write the updated file
  fs.writeFileSync(filePath, newContent);
  console.log(`${lang}: ✓ Updated (now has ${existingKeys.length + missingKeys.length} keys)`);
}

console.log();
console.log('='.repeat(80));
console.log(`STEP 1 COMPLETE: Added ${totalKeysAdded} placeholder keys`);
console.log('='.repeat(80));
console.log();
console.log('Next step: Run translation enrichment to replace English placeholders');
console.log('with proper translations based on French style and guidelines.');
