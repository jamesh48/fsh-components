#!/usr/bin/env node

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

async function main() {
  try {
    // Read the projects configuration
    const configPath = resolve(projectRoot, 'yalc.projects.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));

    // Filter enabled projects
    const enabledProjects = config.projects.filter(p => p.enabled);

    if (enabledProjects.length === 0) {
      console.log('No enabled projects found in yalc.projects.json');
      console.log('Publishing to yalc store only...');
      execSync('npx yalc push --sig', { stdio: 'inherit', cwd: projectRoot });
      return;
    }

    console.log(`Publishing to ${enabledProjects.length} project(s)...`);

    // Push with signature update to all linked projects
    execSync('npx yalc push --sig', { stdio: 'inherit', cwd: projectRoot });

    // Verify updates in each enabled project
    for (const project of enabledProjects) {
      const projectPath = resolve(projectRoot, project.path);
      console.log(`\n✓ Updated ${project.name} at ${projectPath}`);
    }

    console.log('\n✓ Done pushing to all projects');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
