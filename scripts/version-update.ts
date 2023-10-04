// import { execSync } from 'child_process';
// import * as lerna from 'lerna';

// console.log(lerna)

// const submoduleDir = 'enterprise/packages'

// function runCommand(command: string, directory?: string) {
//   console.log(`Running command: ${command}, directory:${directory}`);
//   execSync(command, {
//     stdio: 'inherit',
//     cwd: directory,
//   });
// }

// try {

//   console.log("Step 1: Run lerna version in monorepo");
//   try{
//     runCommand('pnpm lerna version patch --yes --no-git-tag-version --no-push --force-publish');
//   }
//     catch(error){  
//       console.error(`Error: ${error}`);
//   }

//   console.log("Step 2: Push changes in submodule");
//   runCommand('git add .',submoduleDir);
//   runCommand('git commit -m "chore: update versions"',submoduleDir);
//   runCommand('git push',submoduleDir);

//   // console.log("Step 3: Update submodule reference");
//   // runCommand('git add enterprise/packages');
//   // runCommand('git commit -m "chore: update submodule reference"');
//   // runCommand('git push');

//   // console.log("Step 4: Push changes in monorepo versions");
//   // runCommand('git add .');
//   // runCommand('git commit -m "chore: update versions"');
//   // runCommand('git push');

//   console.log("Step 10: Run lerna version in monorepo push and release");
//   try{
//     runCommand('pnpm lerna version patch --yes --create-release github');
//   }
//     catch(error){  
//       console.error(`Error: ${error}`);
//   }

  
// } catch (error) {
//   console.error(`Error: ${error}`);
// }


import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const submoduleDir = 'enterprise/packages'

function runCommand(command: string, directory?: string) {
  console.log(`Running command: ${command}, directory:${directory}`);
  execSync(command, {
    stdio: 'inherit',
    cwd: directory,
  });
}

try {

  console.log("Step 1: Run lerna version in monorepo without committing or creating a release");
  try{
    runCommand('pnpm lerna version patch --yes --no-git-tag-version --no-push --force-publish');
  }
    catch(error){  
      console.error(`Error: ${error}`);
  }

  const lernaJson = JSON.parse(readFileSync(join(__dirname, '../lerna.json'), 'utf-8'));
  const newVersion = lernaJson.version;

  console.log("Step 2: Push changes in submodule");
  runCommand('git add .',submoduleDir);
  runCommand('git commit -m "chore: update versions"',submoduleDir);
  runCommand('git push',submoduleDir);
  runCommand(`git tag v${newVersion}`,submoduleDir);
  runCommand('git push --tags',submoduleDir);

  console.log("Step 3: Commit all changes in monorepo");
  runCommand('git add .');
  runCommand('git commit -m "chore: update versions"');

  console.log("Step 5: Add a GitHub release tag");
  runCommand(`git tag v${newVersion}`);
  runCommand('git push --tags');

} catch (error) {
  console.error(`Error: ${error}`);
}
