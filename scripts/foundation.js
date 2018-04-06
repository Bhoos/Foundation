#!/usr/bin/env node
/**
 * The cli that just proxies over react-native cli, with an
 * extra environment variable - FOUNDATION_PROJECT.module
 *
 * Also overrides certain command like 'init'
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const createProject = require('./create-project');

function getReactNativeDir() {
  // Search for react-native in current directory
  // The project might have included react-native as
  // depedency. Also search on parent as the project
  // might have been a part of a workspace.
  // fall-back to foundation provided react-native
  let folder = process.cwd();
  do {
    const searchPath = folder;
    const dir = path.resolve(searchPath, 'node_modules', 'react-native');
    if (fs.existsSync(dir)) {
      return dir;
    }

    // Move up to look for into workspaces
    folder = path.resolve(searchPath, '..');
    if (folder === searchPath) {
      // Can't find react-native
      break;
    }
  } while (true);

  // Use the react-native provided by foundation
  return path.resolve(__dirname, '..', 'node_modules', 'react-native');
}

// Get the react-native local-cli script to proxy pass the react-native commands
const cli = path.resolve(getReactNativeDir(), 'local-cli', 'cli.js');

// Extract the parameter to pass directly to 'react-native' cli
const args = [cli].concat(process.argv.slice(2));

if (args[1] === 'init') {
  const projectName = args[2];
  if (!projectName) {
    console.log('No project name provided with init script');
  } else {
    console.log('Creating project', projectName);
    console.log('Target Path', path.resolve(args[3] || projectName));
    createProject(projectName, args[3]);
    console.log('New project created. Just move into the new folder and run');
    console.log('   foundation start');
  }
} else {
  // The root folder which is used as working directory for executing react-native
  // For the react-native cli to work correctly this has to be set

  args.push('--config');
  args.push(path.resolve(__dirname, '..', 'rn-cli.config.js'));

  // Proxy to react-native cli, passing `FOUNDATION_PROJECT` through environment
  spawn('node', args, {
    env: process.env,
    stdio: 'inherit',
  });
}
