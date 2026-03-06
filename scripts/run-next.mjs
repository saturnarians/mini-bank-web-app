import fs from 'node:fs';
import { spawn } from 'node:child_process';


process.env.NODE_OPTIONS = '--max-old-space-size=4096';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/run-next.mjs <next-args>');
  process.exit(1);
}

const canonicalCwd = fs.realpathSync.native(process.cwd());
const command = `npx next ${args.join(' ')}`;
const isBuild = args[0] === 'build';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runCommand() {
  return await new Promise((resolve) => {
    const child = spawn(command, {
      cwd: canonicalCwd,
      stdio: 'inherit',
      env: process.env,
      shell: true,
    });

    child.on('exit', (code, signal) => {
      resolve({ code: code ?? 1, signal });
    });
  });
}

const first = await runCommand();
if (first.signal) {
  process.kill(process.pid, first.signal);
}

if (isBuild && first.code !== 0) {
  // Windows may transiently lock .next/export files (EBUSY) near build finalization.
  // A short delay + single retry usually clears it.
  await sleep(1200);
  const second = await runCommand();
  if (second.signal) {
    process.kill(process.pid, second.signal);
  }
  process.exit(second.code);
}

process.exit(first.code);
