const { spawn } = require('child_process');

const child = spawn('npm', ['run', 'dev'], {
  stdio: ['pipe', 'inherit', 'inherit']
});

// Write to stdin to keep it open
setInterval(() => {
  if (child.stdin.writable) {
    child.stdin.write('\n');
  }
}, 10000);

child.on('exit', (code) => {
  console.log('Next.js process exited with code', code);
  process.exit(code);
});
