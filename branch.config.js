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
  const config = require(configFilePath); // Load the config as a JS object

  // Find the "Projectes" section and append the new page entry
  const projectesSection = config.pages.find(section => section.name === "Projectes");
  
  if (projectesSection) {
    // Add the new entry
    projectesSection.pages.push({
      name: capitalizedBranchName,
      path: `/projectes/${lowerCaseBranchName}/`
    });

    // Write the updated object back to observablehq.config.js
    const updatedConfig = `export default ${JSON.stringify(config, null, 2)};`;
    fs.writeFileSync(configFilePath, updatedConfig, 'utf8');
    console.log(`Updated observablehq.config.js with new branch '${capitalizedBranchName}'.`);
  } else {
    console.error("Error: Unable to find 'Projectes' section in config.");
    process.exit(1);
  }

} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}