import { glob } from "glob";
import { join, basename, dirname } from "path";
import { readFileSync, writeFileSync, renameSync } from "fs";

// Configuration
const UI_COMPONENTS_DIR = join(
  process.cwd(),
  "frontend",
  "src",
  "components",
  "ui",
);
const SRC_DIR = join(process.cwd(), "frontend", "src");

// Helper to convert to PascalCase
function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

// Step 1: Rename UI component files to PascalCase
async function renameUIComponents(): Promise<void> {
  console.log("\n🔄 Renaming UI components to PascalCase...");

  try {
    const files = await glob("**/*.tsx", { cwd: UI_COMPONENTS_DIR });

    for (const file of files) {
      const oldPath = join(UI_COMPONENTS_DIR, file);
      const baseName = basename(file, ".tsx");
      const newName = `${toPascalCase(baseName)}.tsx`;
      const newPath = join(dirname(oldPath), newName);

      if (oldPath !== newPath) {
        console.log(`Renaming ${file} to ${newName}...`);
        try {
          renameSync(oldPath, newPath);
          console.log(`Successfully renamed ${file} to ${newName}`);
        } catch (err) {
          console.error(`Error renaming ${file} to ${newName}:`, err);
        }
      }
    }
  } catch (err) {
    console.error("Error finding UI component files:", err);
  }
}

// Step 2: Update imports in all TypeScript/TSX files
async function updateImports(): Promise<void> {
  console.log("\n🔄 Updating imports...");

  try {
    const files = await glob("**/*.tsx", { cwd: SRC_DIR });

    for (const file of files) {
      const filePath = join(SRC_DIR, file);
      let content = readFileSync(filePath, "utf8");

      // Update import statements to use lowercase
      const oldContent = content;
      content = content.replace(
        /from ["']@\/components\/ui\/([A-Za-z-]+)["']/g,
        (match, componentName) => {
          const lowercaseName = componentName.toLowerCase();
          return `from "@/components/ui/${lowercaseName}"`;
        },
      );

      if (content !== oldContent) {
        console.log(`Updating imports in ${file}...`);
        writeFileSync(filePath, content, "utf8");
      }
    }
  } catch (err) {
    console.error("Error updating imports:", err);
  }
}

// Main execution
console.log("🚀 Starting case sensitivity fix...");

const main = async () => {
  console.log("🔄 Renaming UI components to PascalCase...");
  await renameUIComponents();

  console.log("\n🔄 Updating imports...");
  await updateImports();

  console.log("\n✅ Case sensitivity fix completed!");
};

main().catch(console.error);
