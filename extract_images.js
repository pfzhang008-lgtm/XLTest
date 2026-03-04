const fs = require('fs');
const path = require('path');

const htmlPath = 'd:\\Desktop\\XLTest\\code.html';
const outputDir = 'd:\\Desktop\\XLTest\\learning-motivation-app\\src\\static';

try {
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Regex to find data URIs. 
  // Note: The HTML might have line breaks or extra spaces, but usually src="..." is contiguous.
  // However, the previous Read output showed the base64 string might be very long.
  // We'll look for src="data:image/png;base64,..."
  const regex = /src="data:image\/png;base64,([^"]+)"/g;
  
  let match;
  let count = 0;
  
  while ((match = regex.exec(htmlContent)) !== null) {
    count++;
    const base64Data = match[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `cyber-card-0${count}.png`;
    const filePath = path.join(outputDir, fileName);
    
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved ${fileName} to ${outputDir}`);
  }
  
  if (count === 0) {
    console.log('No base64 images found!');
  } else {
    console.log(`Successfully extracted ${count} images.`);
  }
  
} catch (err) {
  console.error('Error:', err);
}
