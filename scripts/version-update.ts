import { execSync } from 'child_process';

function runCommand(command: string, directory?: string) {
  console.log(`Running command: ${command}`);
  execSync(command, {
    stdio: 'inherit',
    cwd: directory,
  });
}

try {
  console.log("Step 1: Run lerna version in monorepo");
  try{
    runCommand('pnpm lerna version patch --yes');
  }
    catch(error){  
      console.error(`Error: ${error.message}`);
  }
  
  console.log("Step 1.1: Install dependencies");
  runCommand('pnpm install');

  console.log("Step 2: Push changes in submodule");
  runCommand('pwd');
  runCommand('cd enterprise/packages');
  runCommand('pwd');
  runCommand('ls -la');

  runCommand('git status');
  runCommand('git add .');
  runCommand('git status');
  
  runCommand('git commit -m "chore: update versions"');
  runCommand('git push');
  runCommand('cd ../../');
  runCommand('pwd');


  // console.log("Step 2: Push changes in submodule");
  // runCommand('cd enterprise/packages');
  // runCommand('git add .');
  // runCommand('git commit -m "chore: update versions"');
  // runCommand('git push');
  // runCommand('cd ../../');

  // console.log("Step 3: Update commit&push submodule reference");
  // runCommand('git add enterprise/packages');
  // runCommand('git commit -m "chore: update submodule reference"');
  // runCommand('git push');

  // console.log("Step 4: Update commit&push monorepo versions");
  // runCommand('git add .');
  // runCommand('git commit -m "chore: update versions"');
  // runCommand('git push');

  // try{
  //   runCommand('pnpm lerna version patch  --yes');
  // }
  // catch(error){  
  //   console.error(`Error: ${error.message}`);
  // }
} catch (error) {
  console.error(`Error: ${error.message}`);
}
