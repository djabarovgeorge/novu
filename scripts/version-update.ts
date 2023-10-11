/* eslint-disable no-console */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const submoduleDir = 'enterprise/packages';

function runCommand(command: string, directory?: string) {
  console.log(`Running command: ${command}${directory ? `directory:${directory}` : '.'}`);
  execSync(command, {
    stdio: 'inherit',
    cwd: directory,
  });
}

(() => {
  try {
    console.log('Step 1: Check for uncommitted changes in submodule git');
    const gitStatus = execSync('git status --porcelain', { cwd: submoduleDir }).toString();
    if (gitStatus) {
      console.error(
        'There are uncommitted changes in the git repository at ' +
          submoduleDir +
          ', please commit or stash them before running this script.'
      );

      console.log('The uncommitted changes are:\n' + gitStatus);

      return;
    } else {
      console.log('No uncommitted changes in submodule git found');
    }

    console.log('Step 2: Run lerna version in monorepo without committing or creating a release');
    runCommand('pnpm lerna version patch --yes --no-git-tag-version --no-push');

    console.log('Step 3: Extract new version from lerna json file');
    const lernaJson = JSON.parse(readFileSync(join(__dirname, '../lerna.json'), 'utf-8'));
    const newVersion = lernaJson.version;
    console.log(`New version ${newVersion} extracted`);

    console.log('Step 4: Push changes in submodule');
    runCommand('git add .', submoduleDir);
    runCommand('git commit -m "chore: update versions"', submoduleDir);
    runCommand('git push', submoduleDir);

    console.log('Step 5: Create release tag for submodule');
    runCommand(`git tag v${newVersion}`, submoduleDir);
    runCommand('git push --tags', submoduleDir);

    console.log('Step 6: Commit version changes and submodule updated hash main repository');
    runCommand('git add .');
    runCommand('git commit -m "chore: update versions"');
    runCommand('git push');

    console.log('Step 7: Create release tag for main repo and push');
    runCommand(`git tag v${newVersion}`);
    runCommand('git push --tags');
  } catch (error) {
    console.error(`Error: ${error}`);
  }
})();
