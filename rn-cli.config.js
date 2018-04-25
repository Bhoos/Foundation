/**
 * The metro bundler configuration file, that allows us to run
 * our react-native project with just javascript files like
 * expo does - expect that its all pure bare-bone react-native
 * without any bloat.
 */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

// Read package file from the app directory
const pkg = require(path.resolve('package.json'));

console.log(`Running app ${pkg.name}@${pkg.version}`);

const config = {};

const cwd = path.resolve('.');

// Hoist dependencies, react and react-native are hoisted by default
// from the foundation, But they might be removed later
const hoistedLibs = {
  'react': __dirname,
  'react-native': __dirname,
};

// Keep linked libraries separately, to assist in development
const linkedLibs = {}
const liveFolders = {};

if (pkg.dependencies) {
  Object.keys(pkg.dependencies).forEach((lib) => {
    const libVersion = pkg.dependencies[lib];

    // Search iteratively for library within node_modules
    // to support workspace where the dependency is hoisted up
    let folder = cwd;
    do {
      const currentFolder = folder;
      const p = path.resolve(currentFolder, 'node_modules', lib);
      // Great we found the library
      if (fs.existsSync(p)) {
        // If its a symlink used it as link library to watch for files for changes
        if (fs.lstatSync(p).isSymbolicLink()) {
          const liveFolder = fs.realpathSync(p);
          linkedLibs[lib] = liveFolder;
          liveFolders[liveFolder] = true;
          return;
        }

        // TODO:: Check if the library version matches, if not report
        // const libPkg = JSON.parse(fs.readFileSync(path.resolve(p, 'package.json')));
        hoistedLibs[lib] = currentFolder;
        liveFolders[currentFolder] = true;
        return;
      }

      // Take a step back and loop until we reach the root
      folder = path.resolve(currentFolder, '..');
      if (folder === currentFolder) {
        break;
      }
    } while(true);

    // The dependency wasn't found. The app will not run without a dependency
    console.error(`ERROR:: '${lib}' could not be found`);
  });
}

// Add the hoisted libraries (react, react-native)
console.log('Hoisting Libraries');
config.extraNodeModules = Object.keys(hoistedLibs).reduce((res, key) => {
  console.log(`  :: ${key} > ${hoistedLibs[key]}`);
  res[key] = path.resolve(hoistedLibs[key], 'node_modules', key);
  return res;
}, {});

console.log('Live Libraries');
Object.keys(linkedLibs).map((key) => {
  console.log(`  :: ${key} > ${linkedLibs[key]}`);
  return linkedLibs[key];
});

// Make sure, we don't include these two folders again
delete liveFolders[cwd];
delete liveFolders[__dirname];

// Use live folders as project roots
const projectRoots = Object.keys(liveFolders);

// Sort the project-roots just to make sure that
// if any specific library belonged to the same workspace
// (which always happens when using workspaces), then keep
// the specific library before the workspace
// I am not 100% sure, about this, but the array order must
// have some preference
projectRoots.sort((a, b) => a > b ? -1 : 1);

// if no hoisting is needed from the foundation root,
// don't use it, as it will provide react and react-native
// multiple times.
// This will remove jest-haste-map: @providesModule naming collision
if (hoistedLibs['react-native'] === __dirname) {
  projectRoots.unshift(__dirname);
}

// Keep the main project root at the top, making sure the foundation
// runs from it's root folder as well
if (cwd !== __dirname) {
  projectRoots.unshift(cwd);
}

// Provde the project roots
config.getProjectRoots = () => projectRoots;

module.exports = config;
