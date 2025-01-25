const { spawn } = require('child_process');
const path = require('path');

// Start the Node.js application
const app = spawn('node', ['dist/app.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: process.env.PORT || 8000,
    NODE_ENV: 'production'
  }
});

app.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
  app.kill('SIGTERM');
});

process.on('SIGINT', () => {
  app.kill('SIGINT');
});
