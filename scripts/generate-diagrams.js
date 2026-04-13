#!/usr/bin/env node
/**
 * Generate UML Diagrams from PlantUML sources
 * Usage: node scripts/generate-diagrams.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const ROOT = path.resolve(path.join(__dirname, '..'));
const DOCS_DIR = path.join(ROOT, 'docs');

// Terminal colors
const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bright: '\x1b[1m',
};

function col(txt, ...codes) {
  return codes.reduce((s, code) => (c[code] || '') + s, '') + String(txt) + c.reset;
}

function success(msg) {
  console.log(col('✓ ', 'green', 'bright') + col(msg, 'green'));
}

function warn(msg) {
  console.log(col('⚠ ', 'yellow', 'bright') + col(msg, 'yellow'));
}

function error(msg) {
  console.log(col('✗ ', 'red', 'bright') + col(msg, 'red'));
}

function isJavaInstalled() {
  try {
    execSync('java -version', { stdio: 'pipe' });
    return true;
  } catch (_) {
    return false;
  }
}

function isPlantUmlInstalled() {
  try {
    const npmList = execSync('npm list -g node-plantuml', { stdio: 'pipe', encoding: 'utf8' });
    return npmList.includes('node-plantuml@');
  } catch (_) {
    return false;
  }
}

function installJava() {
  console.log(col('\nInstalling Java...', 'cyan'));

  try {
    if (os.platform() === 'win32') {
      execSync('winget install --id EclipseAdoptium.Temurin.21.JDK --accept-package-agreements --accept-source-agreements', { stdio: 'inherit' });
    } else if (os.platform() === 'darwin') {
      execSync('brew install openjdk@21', { stdio: 'inherit' });
    } else {
      execSync('sudo apt update && sudo apt install -y default-jre', { stdio: 'inherit' });
    }

    if (isJavaInstalled()) {
      success('Java installed successfully');
      return true;
    }
  } catch (e) {
    error('Java installation failed');
  }

  return false;
}

function installPlantUml() {
  console.log(col('\nInstalling PlantUML (node-plantuml)...', 'cyan'));

  try {
    execSync('npm install -g node-plantuml', { stdio: 'inherit' });
    success('PlantUML installed successfully');
    return true;
  } catch (e) {
    error('PlantUML installation failed');
    return false;
  }
}

async function main() {
  console.log(col('\n╔══════════════════════════════════════════════╗', 'cyan'));
  console.log(col('║  ', 'cyan') + col('UML Diagram Generator', 'bright', 'cyan') + col('                   ║', 'cyan'));
  console.log(col('╚══════════════════════════════════════════════╝\n', 'cyan'));

  // Check for docs directory
  if (!fs.existsSync(DOCS_DIR)) {
    error(`Docs directory not found: ${DOCS_DIR}`);
    process.exit(1);
  }

  // Find PlantUML files
  const pumlFiles = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.puml'));
  if (pumlFiles.length === 0) {
    warn('No .puml files found in docs/');
    process.exit(0);
  }

  console.log(col(`Found ${pumlFiles.length} PlantUML diagram(s)\n`, 'dim'));

  // Check Java
  if (!isJavaInstalled()) {
    warn('Java not found - required for PlantUML');
    const install = installJava();
    if (!install) {
      error('\nPlease install Java manually:');
      console.log(col('  Windows: ', 'dim') + 'winget install EclipseAdoptium.Temurin.21.JDK');
      console.log(col('  macOS:   ', 'dim') + 'brew install openjdk@21');
      console.log(col('  Linux:   ', 'dim') + 'sudo apt install default-jre');
      process.exit(1);
    }
  } else {
    success('Java is installed');
  }

  // Check PlantUML
  if (!isPlantUmlInstalled()) {
    warn('PlantUML (node-plantuml) not found');
    const install = installPlantUml();
    if (!install) {
      error('\nPlease install PlantUML manually:');
      console.log(col('  npm install -g node-plantuml\n', 'dim'));
      process.exit(1);
    }
  } else {
    success('PlantUML is installed');
  }

  // Generate diagrams
  console.log(col('\nGenerating diagrams...\n', 'cyan', 'bright'));

  let generated = 0;
  let failed = 0;

  for (const file of pumlFiles) {
    const pumlPath = path.join(DOCS_DIR, file);
    const baseName = file.replace('.puml', '');

    process.stdout.write(col(`  ${baseName}`, 'dim') + ' → ');

    try {
      // Generate PNG
      execSync(`npx node-plantuml -o "${DOCS_DIR}" "${pumlPath}"`, {
        stdio: 'pipe',
        cwd: ROOT
      });

      // Generate SVG (better quality for web/PDF)
      execSync(`npx node-plantuml -tsvg -o "${DOCS_DIR}" "${pumlPath}"`, {
        stdio: 'pipe',
        cwd: ROOT
      });

      console.log(col('PNG + SVG ', 'green') + col('✓', 'green', 'bright'));
      generated++;
    } catch (e) {
      console.log(col('FAILED ', 'red') + col('✗', 'red', 'bright'));
      failed++;
    }
  }

  console.log('');
  if (generated > 0) {
    success(`Successfully generated ${generated} diagram(s)`);
    console.log(col(`  Location: ${DOCS_DIR}\n`, 'dim'));
  }
  if (failed > 0) {
    warn(`Failed to generate ${failed} diagram(s)`);
  }

  console.log(col('Output formats:', 'cyan'));
  console.log(col('  • PNG - For embedding in Word/PowerPoint', 'dim'));
  console.log(col('  • SVG - For web and high-quality PDF\n', 'dim'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
