import fs from 'node:fs';
import path from 'node:path';

const nextDir = path.join(process.cwd(), '.next');
fs.rmSync(nextDir, { recursive: true, force: true });
console.log(`Cleaned: ${nextDir}`);
