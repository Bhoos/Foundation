const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');

function recursiveCopy(source, target, placeHolders) {
  const files = fs.readdirSync(source);
  files.forEach(((file) => {
    // All our template file names start with an underscore
    if (file[0] !== '_') {
      return;
    }
    const sourceFile = path.resolve(source, file);
    const targetFile = path.resolve(target, file.substr(1));

    // In case the source file is a directly, recurse
    if (fs.lstatSync(sourceFile).isDirectory()) {
      fs.mkdirSync(targetFile);
      recursiveCopy(sourceFile, targetFile, placeHolders);
    } else {
      // Generate a new template file replacing the placeholders
      const data = fs.readFileSync(sourceFile, "utf-8")
      const content = data.replace(/\{\{([^{]*)\}\}/mg, (match, key) => placeHolders[key]);

      fs.writeFileSync(targetFile, content, "utf-8");
    }
  }));
}

module.exports = function createProject(name, targetPath) {
  const placeHolders = {
    name,
    reactVersion: pkg.dependencies['react'],
    reactNativeVersion: pkg.dependencies['react-native'],
  };

  // Create a folder with the given name
  const projectRoot = path.resolve(targetPath || name);
  fs.mkdirSync(projectRoot);

  // recursively copy all the files from the project-template
  // to the projectRoot
  recursiveCopy(path.resolve(__dirname, 'project-template'), projectRoot, placeHolders);
}

