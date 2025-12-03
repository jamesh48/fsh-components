# Yalc Local Development Setup

This guide explains how to use yalc for local development of this component library.

## Quick Start

### In this library (fsh-components):

```bash
# Watch for changes and auto-publish
yarn yalc:watch

# Or manually publish after changes
yarn yalc:publish
```

### In your consuming project:

First time setup (or to update existing setup):
```bash
# Remove existing yalc package if present
yalc remove fsh-components

# Install with link mode for automatic updates
yalc add fsh-components --link

# Install dependencies
yarn install
```

The `--link` flag combined with `--sig` ensures your project automatically picks up changes when the library publishes.

**Note**: If you already have the package installed without `--link`, run the commands above to upgrade to linked mode for better hot-reload support.

## Configuration

### Setting up projects (fsh-components)

1. Copy `yalc.projects.example.json` to `yalc.projects.json`:
   ```bash
   cp yalc.projects.example.json yalc.projects.json
   ```

2. Edit `yalc.projects.json` to add your consuming projects:
   ```json
   {
     "projects": [
       {
         "name": "my-app",
         "path": "../my-app",
         "enabled": true
       }
     ]
   }
   ```

3. Start watch mode:
   ```bash
   yarn yalc:watch
   ```

Now any changes to the `src/` directory will automatically:
- Build the library
- Publish to yalc with signature update (`--sig`)
- Update all linked consuming projects

## How it works

- The library uses `yalc push --sig` to publish changes with an updated signature
  - The `--sig` flag generates a unique signature (hash) for each publish
  - This signature is stored in the consuming project's `yalc.lock` file
- Consuming projects using `yalc add fsh-components --link` will automatically detect these signature changes
  - When the signature changes, yalc updates the package in `node_modules`
- Your dev server (Vite, Next.js, etc.) will hot-reload the changes

### What does `--sig` do?

The `--sig` flag tells yalc to update the package signature (a hash based on file contents). This allows:
1. **Automatic change detection**: Consuming projects can detect when the library has been updated
2. **Efficient updates**: Only changed files are copied
3. **Hot module replacement**: Works seamlessly with dev servers that watch `node_modules`

Without `--sig`, you would need to manually run `yalc update` in each consuming project.

## Troubleshooting

### Changes not appearing in consuming project

1. Make sure you added the package with `--link`:
   ```bash
   yalc remove fsh-components
   yalc add fsh-components --link
   yarn install
   ```

2. Check that your project path is correct in `yalc.projects.json`

3. Restart your dev server if hot-reload isn't working

### Remove yalc package

In your consuming project:
```bash
yalc remove fsh-components
yarn install
```

## Available Scripts

- `yarn yalc:publish` - Build and publish to configured projects
- `yarn yalc:watch` - Watch for changes and auto-publish
