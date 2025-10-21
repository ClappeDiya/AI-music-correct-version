# Case Sensitivity Fix Script

This script fixes case sensitivity issues in the project by:

1. Renaming UI component files to PascalCase
2. Updating all imports to match the new casing

## Prerequisites

- Node.js and npm installed
- Git repository initialized
- TypeScript and ts-node installed

## Installation

```bash
npm install glob
```

## Usage

1. First, create a backup branch:

```bash
git checkout -b backup/case-sensitivity-fix
git add .
git commit -m "backup before case sensitivity fix"
```

2. Run the script:

```bash
npm run fix-casing
```

3. Review the changes:

```bash
git status
git diff
```

4. If everything looks good, commit the changes:

```bash
git add .
git commit -m "fix: standardize component casing to PascalCase"
```

## What the Script Does

1. **File Renaming**

   - Scans the UI components directory
   - Renames files to PascalCase using `git mv`
   - Handles case sensitivity safely

2. **Import Updates**
   - Finds all TypeScript/TSX files
   - Updates import statements to match new casing
   - Preserves other import statement parts

## Troubleshooting

If you encounter issues:

1. **Git Case Sensitivity**

   - If Git doesn't detect case changes, use:

   ```bash
   git config core.ignorecase false
   ```

2. **Manual Rollback**

   - To rollback changes:

   ```bash
   git checkout backup/case-sensitivity-fix
   ```

3. **Partial Updates**
   - If some imports weren't updated, run the script again
   - Check the console output for errors
