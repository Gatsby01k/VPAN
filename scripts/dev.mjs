import { spawn } from 'node:child_process';

// Vite proxies /api to the real SQLite API.
const processes = [
  spawn(process.execPath, ['--watch', 'server.mjs'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: '3000', HOST: '127.0.0.1' },
  }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { stdio: 'inherit' }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  processes.forEach((child) => child.kill('SIGTERM'));
  process.exitCode = code;
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
processes.forEach((child) => {
  child.on('error', (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on('exit', (code) => {
    if (!stopping) stop(code || 0);
  });
});
