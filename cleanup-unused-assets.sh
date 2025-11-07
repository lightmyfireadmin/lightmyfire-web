#!/bin/bash

# LightMyFire Asset Cleanup Script
# Removes 33.7MB of verified unused assets
# Based on comprehensive asset audit dated 2025-11-07

set -e  # Exit on error

echo "================================================="
echo "LightMyFire Asset Cleanup Script"
echo "================================================="
echo "This will delete 277 unused files (33.7MB)"
echo ""
echo "Files to be deleted:"
echo "  - 8 unused illustrations (27.4MB)"
echo "  - 4 unused new assets (3.3MB)"
echo "  - 254 flag PNGs (466KB) - entire directory"
echo "  - 15 unused fonts (2.4MB)"
echo "  - 8 unused root files (170KB)"
echo ""
echo "These files have ZERO references in the codebase."
echo "================================================="
echo ""

# Confirm before proceeding
read -p "Continue with cleanup? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Cleanup cancelled."
    exit 0
fi

echo ""
echo "Creating backup..."
# Create backup
backup_file="assets-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$backup_file" public/ 2>/dev/null
echo "✓ Backup created: $backup_file"
echo ""

# Track deleted files and sizes
deleted_count=0
deleted_size=0

echo "Starting cleanup..."
echo ""

# Function to safely delete file
delete_file() {
    local file=$1
    if [ -f "$file" ]; then
        size=$(du -k "$file" | cut -f1)
        rm "$file"
        deleted_count=$((deleted_count + 1))
        deleted_size=$((deleted_size + size))
        echo "✓ Deleted: $file"
    else
        echo "⚠ Not found: $file"
    fi
}

# Function to safely delete directory
delete_dir() {
    local dir=$1
    if [ -d "$dir" ]; then
        count=$(find "$dir" -type f | wc -l)
        size=$(du -sk "$dir" | cut -f1)
        rm -rf "$dir"
        deleted_count=$((deleted_count + count))
        deleted_size=$((deleted_size + size))
        echo "✓ Deleted directory: $dir ($count files)"
    else
        echo "⚠ Not found: $dir"
    fi
}

echo "=== Deleting Unused Illustrations (8 files, 27.4MB) ==="
delete_file "public/illustrations/variety.png"
delete_file "public/illustrations/big_group.png"
delete_file "public/illustrations/community.png"
delete_file "public/illustrations/commenting.png"
delete_file "public/illustrations/sharing.png"
delete_file "public/illustrations/confused.png"
delete_file "public/illustrations/presentation_card.png"
delete_file "public/illustrations/flame_item.png"
echo ""

echo "=== Deleting Unused New Assets (4 files, 3.3MB) ==="
delete_file "public/newassets/act_for_planet.png"
delete_file "public/newassets/human_mosaic.png"
delete_file "public/newassets/sustainable_lighter.png"
delete_file "public/newassets/creative_lighter.png"
echo ""

echo "=== Deleting Entire Flags Directory (254 files, 466KB) ==="
delete_dir "public/flags"
echo ""

echo "=== Deleting Unused Fonts (15 files, 2.4MB) ==="
cd public/fonts/ 2>/dev/null || { echo "Fonts directory not found"; exit 1; }
delete_file "Poppins-Black.ttf"
delete_file "Poppins-BlackItalic.ttf"
delete_file "Poppins-BoldItalic.ttf"
delete_file "Poppins-ExtraLight.ttf"
delete_file "Poppins-ExtraLightItalic.ttf"
delete_file "Poppins-Italic.ttf"
delete_file "Poppins-Light.ttf"
delete_file "Poppins-LightItalic.ttf"
delete_file "Poppins-MediumItalic.ttf"
delete_file "Poppins-Regular.ttf"
delete_file "Poppins-SemiBold.ttf"
delete_file "Poppins-SemiBoldItalic.ttf"
delete_file "Poppins-Thin.ttf"
delete_file "Poppins-ThinItalic.ttf"
delete_file "Poppins-ExtraBoldItalic.ttf"
cd ../..
echo ""

echo "=== Deleting Unused Root Files (8 files, 170KB) ==="
delete_file "public/SEE1.png"
delete_file "public/circle-scatter-haikei.png"
delete_file "public/file.svg"
delete_file "public/globe.svg"
delete_file "public/next.svg"
delete_file "public/seethrough.png"
delete_file "public/vercel.svg"
delete_file "public/window.svg"
echo ""

echo "================================================="
echo "Cleanup Complete!"
echo "================================================="
echo "Files deleted: $deleted_count"
echo "Space freed: ~$((deleted_size / 1024))MB"
echo "Backup saved: $backup_file"
echo ""
echo "Next steps:"
echo "  1. Run: npm run build"
echo "  2. Test: Homepage, sticker generation, trophies"
echo "  3. Commit: git add -A && git commit -m 'chore: Remove unused assets (33.7MB)'"
echo ""
echo "To restore from backup if needed:"
echo "  tar -xzf $backup_file"
echo "================================================="
