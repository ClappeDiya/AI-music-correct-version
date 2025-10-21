# PowerShell script to fix UI component imports
# This script ensures consistent PascalCase for shadcn/ui component imports

# Get all .tsx and .ts files recursively
$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts"

# UI components to check (in PascalCase)
$components = @(
    "Alert",
    "Avatar",
    "Badge",
    "Button",
    "Calendar",
    "Card",
    "Dialog",
    "DropdownMenu",
    "Form",
    "Input",
    "Label",
    "Progress",
    "ScrollArea",
    "Select",
    "Separator",
    "Skeleton",
    "Switch",
    "Table",
    "Tabs",
    "Toast",
    "Toaster"
)

Write-Host "Fixing UI component imports..."

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($component in $components) {
        # Check for lowercase imports
        $lowerComponent = $component.ToLower()
        
        # Pattern for absolute imports
        if ($content -match "from ['""]@/components/ui/$lowerComponent['""]") {
            $content = $content -replace "from (['""])@/components/ui/$lowerComponent(['""])", "from `$1@/components/ui/$component`$2"
            $modified = $true
            Write-Host "Fixed absolute import for $component in $($file.FullName)"
        }
        
        # Pattern for relative imports
        if ($content -match "from ['""]\.\.?/ui/$lowerComponent['""]") {
            $content = $content -replace "from (['""])\.\.?/ui/$lowerComponent(['""])", "from `$1../ui/$component`$2"
            $modified = $true
            Write-Host "Fixed relative import for $component in $($file.FullName)"
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content
        Write-Host "Updated imports in $($file.FullName)"
    }
}

Write-Host "Done fixing UI component imports." 