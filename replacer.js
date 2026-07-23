const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  content = content.replace(/"Presidência"/g, '"Presidente"');
  content = content.replace(/"Vice-Presidência"/g, '"Vice-Presidente"');
  content = content.replace(/Presidência/g, 'Presidente');
  content = content.replace(/Vice-Presidência/g, 'Vice-Presidente');
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
  }
}

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const allFiles = walkSync('src');
allFiles.forEach(f => {
  if (f.endsWith('.ts') || f.endsWith('.tsx')) {
    replaceInFile(f);
  }
});
