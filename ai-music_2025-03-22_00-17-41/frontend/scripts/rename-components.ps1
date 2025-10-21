# Rename component files to PascalCase
$componentsDir = Join-Path $PSScriptRoot "..\src\components\copyright-free-music"

# Function to convert kebab-case to PascalCase
function ConvertTo-PascalCase {
    param([string]$text)
    $words = $text -split '-'
    $pascalCase = foreach($word in $words) {
        $word.Substring(0,1).ToUpper() + $word.Substring(1).ToLower()
    }
    return $pascalCase -join ''
}

# Get all .tsx files
Get-ChildItem -Path $componentsDir -Filter "*.tsx" -Recurse | ForEach-Object {
    $directory = $_.DirectoryName
    $fileName = $_.BaseName
    $extension = $_.Extension
    
    # Skip if filename is already PascalCase
    if ($fileName -cmatch '^[A-Z][a-zA-Z0-9]*$') {
        Write-Host "Skipping $fileName - already in PascalCase"
        return
    }
    
    # Convert to PascalCase
    $newFileName = ConvertTo-PascalCase -text $fileName
    $newPath = Join-Path $directory "$newFileName$extension"
    
    Write-Host "Renaming $($_.FullName) to $newPath"
    Rename-Item -Path $_.FullName -NewName "$newFileName$extension" -Force
}

Write-Host "Component renaming complete!" 