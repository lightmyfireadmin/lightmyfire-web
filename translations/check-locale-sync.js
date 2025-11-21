const fs = require('fs');
const path = require('path');

const localesDir = './locales';

// Get all locale files (exclude config and utility files)
const localeFiles = fs.readdirSync(localesDir)
  .filter(file => file.endsWith('.ts') && !['server.ts', 'client.ts', 'config.ts', 'languages.ts'].includes(file))
  .sort();

console.log(`Found ${localeFiles.length} locale files:\n${localeFiles.join(', ')}\n`);

// Function to extract all keys from a locale file
function extractKeysFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys = [];

  // Match keys at start of line:   'key':
  const keyRegex = /^\s*['"]([^'"]+)['"]\s*:/gm;
  let match;

  while ((match = keyRegex.exec(content)) !== null) {
    keys.push(match[1]);
  }

  return keys.sort();
}

// Read and parse each locale file
const localeData = {};

for (const file of localeFiles) {
  const filePath = path.join(localesDir, file);
  const lang = file.replace('.ts', '');

  try {
    const keys = extractKeysFromFile(filePath);
    localeData[lang] = keys;

    // Check for duplicates
    const uniqueKeys = new Set(keys);
    if (uniqueKeys.size !== keys.length) {
        console.log(`${lang}: ${keys.length} keys (${keys.length - uniqueKeys.size} duplicates)`);
    } else {
        console.log(`${lang}: ${keys.length} keys`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
}

console.log();

// Use English as the reference
const referenceKeys = localeData['en'] || [];
// Use Set for faster lookup and uniqueness
const referenceKeySet = new Set(referenceKeys);
console.log(`Reference (English) has ${referenceKeySet.size} unique keys\n`);

// Compare each locale with the reference
const missingKeysReport = {};
let totalMissingKeys = 0;

for (const [lang, keys] of Object.entries(localeData)) {
  if (lang === 'en') continue;

  const uniqueKeys = [...new Set(keys)]; // Remove duplicates for comparison

  const missing = referenceKeys.filter(key => !uniqueKeys.includes(key));
  const extra = uniqueKeys.filter(key => !referenceKeySet.has(key));

  if (missing.length > 0 || extra.length > 0) {
    missingKeysReport[lang] = { missing, extra, total: keys.length };
    totalMissingKeys += missing.length;
  }
}

// Print report
console.log('='.repeat(80));
console.log('LOCALE SYNCHRONIZATION REPORT');
console.log('='.repeat(80));
console.log();

if (Object.keys(missingKeysReport).length === 0) {
  console.log('✓ All locales are synchronized!');
} else {
  console.log(`Found issues in ${Object.keys(missingKeysReport).length} locale(s)\n`);

  // Sort by number of missing keys (descending)
  const sortedLangs = Object.entries(missingKeysReport)
    .sort((a, b) => b[1].missing.length - a[1].missing.length);

  for (const [lang, issues] of sortedLangs) {
    console.log(`\n${lang.toUpperCase()}:`);
    console.log('-'.repeat(40));
    console.log(`  Total keys: ${issues.total} (should be ${referenceKeys.length})`);

    if (issues.missing.length > 0) {
      console.log(`  Missing ${issues.missing.length} keys:`);
      issues.missing.slice(0, 15).forEach(key => console.log(`    - ${key}`));
      if (issues.missing.length > 15) {
        console.log(`    ... and ${issues.missing.length - 15} more`);
      }
    }

    if (issues.extra.length > 0) {
      console.log(`  Extra ${issues.extra.length} keys (not in English):`);
      issues.extra.slice(0, 5).forEach(key => console.log(`    - ${key}`));
      if (issues.extra.length > 5) {
        console.log(`    ... and ${issues.extra.length - 5} more`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`SUMMARY: ${totalMissingKeys} total missing keys across all locales`);
  console.log('='.repeat(80));
}

// Save detailed report to JSON
const detailedReport = {
  timestamp: new Date().toISOString(),
  totalLocales: localeFiles.length,
  referenceLocale: 'en',
  totalReferenceKeys: referenceKeys.length,
  localesWithIssues: Object.keys(missingKeysReport).length,
  totalMissingKeys,
  details: missingKeysReport
};

fs.writeFileSync('./locale-sync-report.json', JSON.stringify(detailedReport, null, 2));
console.log('\nDetailed report saved to: locale-sync-report.json');
