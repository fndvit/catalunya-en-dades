import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to handle the __dirname with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the branch name passed from the npm script
const branchName = process.argv[2];

if (!branchName) {
  console.error("Error: No branch name provided.");
  process.exit(1);
}

// Convert the branch name to lowercase for certain cases
const lowerCaseBranchName = branchName.toLowerCase();

// Capitalize the first letter for certain cases (Branchname)
const capitalizedBranchName = branchName.charAt(0).toUpperCase() + branchName.slice(1).toLowerCase();

try {
  // Commit any uncommitted changes in the current branch (optional but recommended)
  execSync('git add .');
  execSync('git commit -m "Save work before switching branches" || true', { stdio: 'inherit' });

  // Create the new branch (lowercase) and switch to it
  execSync(`git checkout -b ${lowerCaseBranchName}`, { stdio: 'inherit' });
  console.log(`Branch '${lowerCaseBranchName}' created and switched to successfully.`);

  // Now create the folder structure and files in the new branch
  const newProjectPath = path.join(__dirname, 'src', 'projectes', lowerCaseBranchName);

  fs.mkdirSync(newProjectPath, { recursive: true });
  fs.mkdirSync(path.join(newProjectPath, 'data'));

  // Create index.md using capitalizedBranchName for readability in the file
  fs.writeFileSync(path.join(newProjectPath, 'index.md'), `# ${capitalizedBranchName}\n\nProject page content here.`);

  // Create dades.json.js with lowercase for data file
  fs.writeFileSync(path.join(newProjectPath, 'data', 'dades.json.js'), `// Data for ${capitalizedBranchName}`);

  console.log(`Created folder and files for '${lowerCaseBranchName}' in branch '${lowerCaseBranchName}'.`);

  // Update observablehq.config.js in the new branch
  const configFilePath = path.join(__dirname, 'observablehq.config.js');
  let configFileContent = fs.readFileSync(configFilePath, 'utf8');

  const newPageEntry = `{name: "${capitalizedBranchName}", path: "/projectes/${lowerCaseBranchName}/"}`;
  const projectesSectionRegex = /({\s*name:\s*"Projectes",\s*path:\s*".*?",\s*open:\s*false,\s*pages:\s*\[\s*)([^]*?)(\s*]\s*})/;

  const match = configFileContent.match(projectesSectionRegex);

  if (match) {
    const existingPages = match[2].trim();
    const lastPageEntry = existingPages.split('\n').pop().trim();

    // Check if last entry has a comma, and add one if necessary
    const pagesWithComma = lastPageEntry.endsWith(',')
      ? existingPages
      : existingPages + ',';

    const updatedPages = pagesWithComma + `\n        ${newPageEntry}`;

    configFileContent =
      configFileContent.slice(0, match.index + match[1].length) +
      updatedPages +
      configFileContent.slice(match.index + match[0].length);

    // Ensure correct closing brackets for "Projectes" and "pages"
    if (!configFileContent.endsWith('  ],')) {
      configFileContent += '\n  ],';
    }

    fs.writeFileSync(configFilePath, configFileContent, 'utf8');
    console.log(`Updated observablehq.config.js with new branch '${capitalizedBranchName}'.`);
  } else {
    console.error("Error: Unable to find 'Projectes' section in config.");
    process.exit(1);
  }

} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}