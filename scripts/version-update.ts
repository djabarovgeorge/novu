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
    runCommand('pnpm lerna version patch');
  }
    catch(error){  
      console.error(`Error: ${error.message}`);
  }

  console.log("Step 2: Install dependencies and push changes in submodule");
  runCommand('pnpm install');
  runCommand('cd', 'enterprise/packages');
  runCommand('git add .', 'enterprise/packages/digest-schedule');
  runCommand('git commit -m "Update version"');
  runCommand('git push');
  runCommand('cd', '../../');

  console.log("Step 3: Navigate back to monorepo and update submodule reference");
  runCommand('git add enterprise/packages');
  runCommand('git commit -m "Update submodule reference"');
  runCommand('git push');

  console.log("Step 4: Navigate back to monorepo and update submodule reference");
  runCommand('git add enterprise/packages');
  runCommand('git commit -m "Update submodule reference"');
  runCommand('git push');

  console.log("Step 5: Push changes in monorepo");
  runCommand('git commit -m "Update version"');
  runCommand('git push');

  try{
    runCommand('pnpm lerna version patch');
  }
  catch(error){  
    console.error(`Error: ${error.message}`);
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
}
