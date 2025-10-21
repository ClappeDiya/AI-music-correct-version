# PowerShell script to list files with inconsistent UI component imports
$components = @(
    "Alert",
    "Avatar", 
    "Badge",
    "Button",
    "Calendar",
    "Card",
    "Checkbox",
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

Write-Host "Checking UI component imports..."

Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $hasLowerCase = $false
    
    foreach ($component in $components) {
        # Check for lowercase imports
        $pattern = "from ['`"]@/components/ui/$($component.ToLower())[`"']"
        if ($content -match $pattern) {
            Write-Host "Found lowercase import in $($_.FullName):"
            Write-Host "  - $component"
            $hasLowerCase = $true
        }
        
        # Check for relative lowercase imports
        $pattern = "from ['`"]../ui/$($component.ToLower())[`"']"
        if ($content -match $pattern) {
            Write-Host "Found lowercase relative import in $($_.FullName):"
            Write-Host "  - $component"
            $hasLowerCase = $true
        }
    }
}

Write-Host "Done checking UI component imports." 