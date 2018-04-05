/**
 * The metro bundler configuration file, that allows us to run
 * our react-native project with just javascript files like
 * expo does - expect that its all pure bare-bone react-native
 * without any bloat.
 */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

// eslint-disable-next-line import/no-dynamic-require
const pkg = require(path.resolve(process.env.FOUNDATION_PROJECT, 'package.json'));

const hoistedLibs = ['react', 'react-native'];

function getLinkedLibs() {
  // Search for symbolic links and add them into project roots
  // So we can debug the linked libraries without restarting the
  // bundler
  if (!pkg.dependencies) {
    return [];
  }

  return Object.keys(pkg.dependencies).reduce((res, lib) => {
    const p = path.resolve(process.env.FOUNDATION_PROJECT, 'node_modules', lib);
    if (fs.lstatSync(p).isSymbolicLink()) {
      res.push(fs.realpathSync(p));
    }

    return res;
  }, []);
}

const linkedLibs = getLinkedLibs();
// Display a warning message in case there are linked libraries
if (linkedLibs.length > 0) {
  console.warn('WARNING: The following libraries are being linked from the source');
  linkedLibs.forEach(lib => console.log('  >', lib));
  console.log('It is ok to link libraries for testing that particular library.');
  console.log('However for production make sure you have proper versions of the');
  console.log('libraries installed.');
}

module.exports = {
  extraNodeModules: hoistedLibs.reduce((res, lib) => ({
    ...res,
    [lib]: path.resolve(__dirname, 'node_modules', lib),
  }), {}),
  getProjectRoots() {
    return [
      process.env.FOUNDATION_PROJECT,
      // path.resolve(__dirname, '..', 'demo'),
      path.resolve(__dirname),
      ...linkedLibs,
    ];
  },
};
