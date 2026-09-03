import { existsSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';

rmSync('dist', { recursive: true, force: true });

const executable =
  process.platform === 'win32'
    ? 'node_modules\\.bin\\vinext.cmd'
    : 'node_modules/.bin/vinext';
const child = spawn(executable, ['build'], {
  shell: process.platform === 'win32',
  env: process.env,
});

let output = '';
child.stdout.on('data', (chunk) => {
  const text = chunk.toString();
  output += text;
  process.stdout.write(text);
});
child.stderr.on('data', (chunk) => {
  const text = chunk.toString();
  output += text;
  process.stderr.write(text);
});

child.on('close', (code) => {
  const staticExportReady = existsSync('dist/client/index.html');
  const completedBeforeWindowsShutdownFault =
    staticExportReady &&
    output.includes('Build complete.') &&
    output.includes('UV_HANDLE_CLOSING');

  if (code === 0 || completedBeforeWindowsShutdownFault) {
    if (completedBeforeWindowsShutdownFault) {
      console.log(
        '\nStatic export verified after a Windows runtime shutdown warning.',
      );
    }
    process.exit(0);
  }

  process.exit(code ?? 1);
});
