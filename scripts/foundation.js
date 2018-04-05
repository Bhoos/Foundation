#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

// The root folder which is used as working directory for executing react-native
// For the react-native cli to work correctly this has to be set
const root = path.resolve(__dirname, '..');

const reactNativeDir = path.resolve(root, 'node_modules', 'react-native');

// Get the react-native local-cli script to proxy pass the react-native commands
const cli = path.resolve(reactNativeDir, 'local-cli', 'cli.js');

// Extract the parameter to pass directly to 'react-native' cli
const args = [cli].concat(process.argv.slice(2));

// Proxy to react-native cli, passing `FOUNDATION_PROJECT` through environment
spawn('node', args, {
  cwd: root,
  env: {
    ...process.env,
    FOUNDATION_PROJECT: process.cwd(),
  },
  stdio: 'inherit',
});
