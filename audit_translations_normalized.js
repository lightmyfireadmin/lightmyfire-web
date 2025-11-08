#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to normalize a key (convert underscores to dots for comparison)
function normalizeKey(key) {
  // Replace underscores with dots for consistent comparison
  return key.replace(/_/g, '.');
}

// Function to extract all keys from a locale file
function extractKeys(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const keys = [];

    // Match all quoted keys in the format 'key.name.here': 'value'
    const keyRegex = /['"]([^'"]+)['"]\s*:/g;
    let match;

    while ((match = keyRegex.exec(content)) !== null) {
      keys.push(match[1]);
    }

    return keys;
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error.message);
    return [];
  }
}

// Main audit function
function auditTranslations() {
  const localesDir = '/home/user/lightmyfire-web/locales';

  const enKeys = extractKeys(path.join(localesDir, 'en.ts'));
  const esKeys = extractKeys(path.join(localesDir, 'es.ts'));
  const deKeys = extractKeys(path.join(localesDir, 'de.ts'));
  const frKeys = extractKeys(path.join(localesDir, 'fr.ts'));

  console.log('='.repeat(80));
  console.log('TRANSLATION KEY AUDIT REPORT (WITH NORMALIZATION)');
  console.log('='.repeat(80));
  console.log();

  console.log('KEY COUNTS:');
  console.log('-'.repeat(80));
  console.log(`English (EN):  ${enKeys.length} keys`);
  console.log(`Spanish (ES):  ${esKeys.length} keys`);
  console.log(`German (DE):   ${deKeys.length} keys`);
  console.log(`French (FR):   ${frKeys.length} keys`);
  console.log();

  // Create normalized maps for comparison
  const enNormalizedMap = new Map(enKeys.map(k => [normalizeKey(k), k]));
  const esNormalizedMap = new Map(esKeys.map(k => [normalizeKey(k), k]));
  const deNormalizedMap = new Map(deKeys.map(k => [normalizeKey(k), k]));
  const frNormalizedMap = new Map(frKeys.map(k => [normalizeKey(k), k]));

  // Find missing keys (normalized comparison)
  const esMissing = enKeys.filter(key => !esNormalizedMap.has(normalizeKey(key)));
  const deMissing = enKeys.filter(key => !deNormalizedMap.has(normalizeKey(key)));
  const frMissing = enKeys.filter(key => !frNormalizedMap.has(normalizeKey(key)));

  // Group missing keys by category (first part of the key)
  function groupByCategory(keys) {
    const grouped = {};
    keys.forEach(key => {
      const category = key.split(/[._]/)[0];
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(key);
    });
    return grouped;
  }

  console.log('='.repeat(80));
  console.log('MISSING KEYS IN SPANISH (ES)');
  console.log('='.repeat(80));
  console.log(`Total missing: ${esMissing.length} keys`);
  console.log();

  if (esMissing.length > 0) {
    const grouped = groupByCategory(esMissing);
    const categories = Object.keys(grouped).sort();
    for (const category of categories) {
      console.log(`\n${category.toUpperCase()} (${grouped[category].length} keys):`);
      grouped[category].forEach(key => console.log(`  - ${key}`));
    }
  } else {
    console.log('✓ No missing keys!');
  }

  console.log();
  console.log('='.repeat(80));
  console.log('MISSING KEYS IN GERMAN (DE)');
  console.log('='.repeat(80));
  console.log(`Total missing: ${deMissing.length} keys`);
  console.log();

  if (deMissing.length > 0) {
    const grouped = groupByCategory(deMissing);
    const categories = Object.keys(grouped).sort();
    for (const category of categories) {
      console.log(`\n${category.toUpperCase()} (${grouped[category].length} keys):`);
      grouped[category].forEach(key => console.log(`  - ${key}`));
    }
  } else {
    console.log('✓ No missing keys!');
  }

  console.log();
  console.log('='.repeat(80));
  console.log('MISSING KEYS IN FRENCH (FR) - NORMALIZED');
  console.log('='.repeat(80));
  console.log(`Total missing: ${frMissing.length} keys`);
  console.log();

  if (frMissing.length > 0) {
    const grouped = groupByCategory(frMissing);
    const categories = Object.keys(grouped).sort();
    for (const category of categories) {
      console.log(`\n${category.toUpperCase()} (${grouped[category].length} keys):`);
      grouped[category].forEach(key => console.log(`  - ${key}`));
    }
  } else {
    console.log('✓ No missing keys! French translation is 100% complete!');
  }

  console.log();
  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Spanish (ES): ${esMissing.length} keys need translation (${((1 - esMissing.length / enKeys.length) * 100).toFixed(1)}% complete)`);
  console.log(`German (DE):  ${deMissing.length} keys need translation (${((1 - deMissing.length / enKeys.length) * 100).toFixed(1)}% complete)`);
  console.log(`French (FR):  ${frMissing.length} keys need translation (${((1 - frMissing.length / enKeys.length) * 100).toFixed(1)}% complete)`);
  console.log();

  // Additional note about French
  console.log('NOTE: French (FR) uses dot notation (e.g., "add.post.title") instead of');
  console.log('      underscore notation (e.g., "add_post.title"). Both formats work.');
  console.log();

  // Write detailed reports to files
  fs.writeFileSync('/home/user/lightmyfire-web/es_missing_keys_final.txt', esMissing.join('\n'));
  fs.writeFileSync('/home/user/lightmyfire-web/de_missing_keys_final.txt', deMissing.join('\n'));
  fs.writeFileSync('/home/user/lightmyfire-web/fr_missing_keys_final.txt', frMissing.join('\n'));

  console.log('Detailed reports saved to:');
  console.log('  - es_missing_keys_final.txt');
  console.log('  - de_missing_keys_final.txt');
  console.log('  - fr_missing_keys_final.txt');
  console.log();
}

auditTranslations();
