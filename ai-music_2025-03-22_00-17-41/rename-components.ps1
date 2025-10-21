# Get all .tsx files in the UI components directory
$files = Get-ChildItem -Path "frontend/src/components/ui" -Filter "*.tsx"

foreach ($file in $files) {
    # Convert first letter to uppercase
    $newName = $file.Name.Substring(0,1).ToUpper() + $file.Name.Substring(1)
    
    # Only rename if the new name is different
    if ($file.Name -ne $newName) {
        Write-Host "Renaming $($file.Name) to $newName"
        Rename-Item -Path $file.FullName -NewName $newName -Force
    }
}

Write-Host "Component renaming complete" 