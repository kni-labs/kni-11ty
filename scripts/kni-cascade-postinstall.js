#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Use process.cwd() so script works regardless of its own location
const ROOT = process.cwd();
const SCSS_ROOT = path.join(ROOT, 'src', 'assets', 'css');
const STYLELINT_TARGET = path.join(ROOT, '.stylelintrc.cjs');
const PKG_PATH = path.join(ROOT, 'package.json');
const README_PATH = path.join(ROOT, 'README.md');

const log = (msg) => console.log(`[kni-cascade] ${msg}`);

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function ask(question, defaultValue) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const suffix = defaultValue ? ` [${defaultValue}]: ` : ': ';
    rl.question(question + suffix, (answer) => { rl.close(); resolve((answer || defaultValue || '').trim()); });
  });
}

function normalizeProjectName(input) {
  let s = (input || '').trim();
  if (!s) return 'Project Name';
  s = s.replace(/[-_]+/g, ' ');
  s = s.replace(/\s+/g, ' ');
  return s.split(' ').filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function slugFromName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function maybeRunInit() {
  if (!process.stdout.isTTY || !process.stdin.isTTY) {
    log('Non-interactive environment; skipping init prompts.');
    return;
  }

  if (!fs.existsSync(PKG_PATH)) {
    log('package.json not found; skipping init.');
    return;
  }

  let pkgRaw = fs.readFileSync(PKG_PATH, 'utf8');
  let pkg = {};
  try { pkg = JSON.parse(pkgRaw); } catch { log('package.json invalid JSON; skipping init.'); return; }

  if (pkg.name && pkg.name !== 'kni-11ty' && pkg.name !== '__PROJECT_SLUG__') {
    log('package.json already initialized; skipping interactive init.');
    return;
  }

  console.log('\n[kni-init] This project is using boilerplate defaults.');
  console.log('[kni-init] Let\'s set it up.\n');

  const defaultName = 'KNI Project';
  const projectNameInput = await ask('Project name', defaultName);
  const projectName = normalizeProjectName(projectNameInput || defaultName);
  const defaultDescription = `Website for ${projectName}`;
  const projectDescription = await ask('Project description', defaultDescription);

  const slug = slugFromName(projectName) || 'kni-project';

  pkg.name = slug;
  pkg.description = projectDescription || defaultDescription;
  pkg.kni = pkg.kni || {};
  pkg.kni.projectName = projectName;

  try {
    fs.writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    log(`Updated package.json with name="${pkg.name}" and projectName="${projectName}"`);
  } catch (err) {
    log(`Failed to write package.json: ${err.message}`);
  }

  if (fs.existsSync(README_PATH)) {
    try {
      let readme = fs.readFileSync(README_PATH, 'utf8');
      const replaced = readme
        .replace(/__PROJECT_NAME__/g, projectName)
        .replace(/__PROJECT_DESCRIPTION__/g, projectDescription || defaultDescription);

      if (replaced !== readme) {
        fs.writeFileSync(README_PATH, replaced, 'utf8');
        log('Updated README.md with project details.');
      } else {
        log('README.md did not contain placeholders; skipping README update.');
      }
    } catch (err) {
      log(`Failed to update README.md: ${err.message}`);
    }
  }
}

async function main() {
  const stylesExists = fs.existsSync(SCSS_ROOT) && fs.statSync(SCSS_ROOT).isDirectory();
  const stylesNotEmpty = stylesExists && fs.readdirSync(SCSS_ROOT).length > 0;
  const isInitialized = stylesNotEmpty || fs.existsSync(STYLELINT_TARGET);

  let cascadePkgPath;
  try {
    cascadePkgPath = require.resolve('kni-cascade/package.json', { paths: [ROOT] });
  } catch (e) {
    if (isInitialized) {
      log('kni-cascade not found in node_modules but project already initialized. Skipping install.');
    } else {
      log('kni-cascade not found; installing latest from GitHub (kni-labs/kni-cascade)...');
      try {
        execSync('pnpm add -D kni-labs/kni-cascade', { stdio: 'inherit', cwd: ROOT });
        cascadePkgPath = require.resolve('kni-cascade/package.json', { paths: [ROOT] });
        log('Installed kni-cascade into node_modules');
      } catch (err) {
        console.error('[kni-cascade] Failed to install kni-cascade:', err.message);
        return;
      }
    }
  }

  let seeded = false;

  if (!isInitialized) {
    if (cascadePkgPath) {
      const CASCADE_ROOT = path.dirname(cascadePkgPath);
      const CASCADE_SCSS = path.join(CASCADE_ROOT, 'scss');
      const CASCADE_STYLELINT = path.join(CASCADE_ROOT, '.stylelintrc.cjs');

      if (fs.existsSync(CASCADE_SCSS)) {
        try {
          copyDir(CASCADE_SCSS, SCSS_ROOT);
          seeded = true;
          log(`Seeded src/styles/ from kni-cascade (${path.relative(ROOT, SCSS_ROOT)})`);
        } catch (err) {
          log(`Failed to copy scss: ${err.message}`);
        }
      } else {
        log('Installed kni-cascade has no scss/ directory. Skipping scss seed.');
      }

      if (fs.existsSync(CASCADE_STYLELINT)) {
        try {
          fs.copyFileSync(CASCADE_STYLELINT, STYLELINT_TARGET);
          log('Synced .stylelintrc.cjs from kni-cascade');
        } catch (err) {
          log(`Failed to sync .stylelintrc.cjs: ${err.message}`);
        }
      } else {
        log('kni-cascade has no .stylelintrc.cjs. Skipping stylelint sync.');
      }

      try {
        const cascadePkgJsonPath = path.join(CASCADE_ROOT, 'package.json');
        if (fs.existsSync(cascadePkgJsonPath)) {
          const cascadePkg = JSON.parse(fs.readFileSync(cascadePkgJsonPath, 'utf8'));
          const hasPxv = (cascadePkg.dependencies && cascadePkg.dependencies['postcss-pxv']) || (cascadePkg.devDependencies && cascadePkg.devDependencies['postcss-pxv']);
          if (hasPxv) {
            const postcssCfgPath = path.join(ROOT, 'postcss.config.js');
            const cfg = `module.exports = {\n  plugins: [\n    require('postcss-pxv')(),\n    require('autoprefixer')\n  ]\n};\n`;
            fs.writeFileSync(postcssCfgPath, cfg, 'utf8');
            log('Wrote postcss.config.js to require postcss-pxv and autoprefixer');
          } else {
            log('kni-cascade does not list postcss-pxv as a dependency; leaving postcss.config.js as-is.');
          }
        }
      } catch (err) {
        log(`Error while wiring pxv plugin: ${err.message}`);
      }
    } else {
      log('kni-cascade not available; cannot seed scss.');
    }
  } else {
    log('src/styles/ already exists or .stylelintrc.cjs present; skipping cascade seed.');
  }

  await maybeRunInit();

  if (seeded) {
    try {
      const SCRIPTS_DIR = path.join(ROOT, 'scripts');
      if (fs.existsSync(SCRIPTS_DIR)) {
        fs.rmSync(SCRIPTS_DIR, { recursive: true, force: true });
        log(`Removed scripts directory: ${path.relative(ROOT, SCRIPTS_DIR)}`);
      }
      // Remove maintainer helper file if present (should not be kept in consumer projects)
      const MAINTAINERS = path.join(ROOT, 'MAINTAINERS.md');
      if (fs.existsSync(MAINTAINERS)) {
        try {
          fs.unlinkSync(MAINTAINERS);
          log('Removed MAINTAINERS.md from project after initial seed');
        } catch (err) {
          log(`Failed to remove MAINTAINERS.md: ${err.message}`);
        }
      }
    } catch (err) {
      log(`Failed to remove scripts directory: ${err.message}`);
    }
  }

  log('Done.');
}

main().catch((err) => { console.error('[kni-cascade] Postinstall failed:', err.message); process.exit(1); });
