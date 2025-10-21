const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Map of component names to their correct lowercase filenames
const componentMap = {
  Button: "button",
  Input: "input",
  Label: "label",
  Card: "card",
  Table: "table",
  Checkbox: "checkbox",
  Select: "select",
  Textarea: "textarea",
  Skeleton: "skeleton",
  Form: "form",
  Toast: "toast",
  Slider: "slider",
};

// Function to process a file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Replace imports
  Object.entries(componentMap).forEach(([component, lowercase]) => {
    const regex = new RegExp(`from ["']@/components/ui/${component}["']`, "g");
    if (regex.test(content)) {
      content = content.replace(regex, `from "@/components/ui/${lowercase}"`);
      modified = true;
    }
  });

  // Save changes if modified
  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Updated imports in ${filePath}`);
  }
}

// Find all TypeScript and TSX files
const files = execSync('git ls-files "*.ts" "*.tsx"', { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

// Process each file
files.forEach((file) => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    processFile(fullPath);
  }
});
