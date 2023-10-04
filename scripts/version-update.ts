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

  console.log("Step 2: Navigate to submodule and update version");
  runCommand('npm version patch', 'enterprise/packages/digest-schedule');

  console.log("Step 3: Install dependencies and push changes in submodule");
  runCommand('pnpm install', 'enterprise/packages/digest-schedule');
  runCommand('git add .', 'enterprise/packages/digest-schedule');
  runCommand('git commit -m "Update version"', 'enterprise/packages/digest-schedule');
  runCommand('git push', 'enterprise/packages/digest-schedule');

  console.log("Step 4: Navigate back to monorepo and update submodule reference");
  runCommand('git add enterprise/packages/digest-schedule');
  runCommand('git commit -m "Update submodule reference"');
  runCommand('git push');

  console.log("Step 5: Run lerna version again in monorepo");
  try{
    runCommand('pnpm lerna version patch');
  }
  catch(error){  
    console.error(`Error: ${error.message}`);
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
}
