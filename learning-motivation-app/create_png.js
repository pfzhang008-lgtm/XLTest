const fs = require('fs');
const path = require('path');
const targetPath = path.resolve('src/static/transparent.png');
const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
try {
  fs.writeFileSync(targetPath, Buffer.from(base64, 'base64'));
  console.log('Successfully created ' + targetPath);
} catch (err) {
  console.error('Error creating file:', err);
}
