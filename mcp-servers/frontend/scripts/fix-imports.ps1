# Script to fix import statements to use PascalCase
$components = @(
    @{ Old = "button"; New = "Button" },
    @{ Old = "card"; New = "Card" },
    @{ Old = "input"; New = "Input" },
    @{ Old = "label"; New = "Label" },
    @{ Old = "scrollarea"; New = "ScrollArea" },
    @{ Old = "dropdownmenu"; New = "DropdownMenu" },
    @{ Old = "textarea"; New = "Textarea" },
    @{ Old = "toggle"; New = "Toggle" },
    @{ Old = "separator"; New = "Separator" },
    @{ Old = "slider"; New = "Slider" },
    @{ Old = "switch"; New = "Switch" },
    @{ Old = "table"; New = "Table" },
    @{ Old = "tabs"; New = "Tabs" },
    @{ Old = "select"; New = "Select" },
    @{ Old = "popover"; New = "Popover" },
    @{ Old = "progress"; New = "Progress" },
    @{ Old = "checkbox"; New = "Checkbox" },
    @{ Old = "dialog"; New = "Dialog" },
    @{ Old = "alert"; New = "Alert" },
    @{ Old = "avatar"; New = "Avatar" },
    @{ Old = "badge"; New = "Badge" }
)

$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($component in $components) {
        $oldImport = "from ['""']@/components/ui/$($component.Old)['""']"
        $newImport = "from '@/components/ui/$($component.New)'"
        
        if ($content -match $oldImport) {
            $content = $content -replace $oldImport, $newImport
            $modified = $true
            Write-Host "Fixed import in $($file.FullName): $($component.Old) -> $($component.New)"
        }
    }
    
    if ($modified) {
        $content | Set-Content $file.FullName -NoNewline
    }
}

Write-Host "Import statements have been updated to use PascalCase" 