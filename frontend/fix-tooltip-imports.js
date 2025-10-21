const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

async function main() {
  try {
    // Find all TypeScript files
    const files = await glob('src/**/*.{ts,tsx}', { cwd: __dirname });
    
    let count = 0;
    
    for (const file of files) {
      const filePath = path.join(__dirname, file);
      
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        
        // Replace imports that use lowercase tooltip with uppercase Tooltip
        const newData = data.replace(/from ["']@\/components\/ui\/tooltip["']/g, 'from "@/components/ui/Tooltip"');
        
        if (newData !== data) {
          count++;
          fs.writeFileSync(filePath, newData, 'utf8');
          console.log(`Fixed tooltip import in ${file}`);
        }
      } catch (err) {
        console.error(`Error processing file ${file}:`, err);
      }
    }
    
    console.log(`Process completed. Fixed imports in ${count} files.`);
  } catch (err) {
    console.error('Error finding files:', err);
  }
}

main(); 