$directories = @(
    "vr-music-experiences|vr_music_experiences",
    "collaborative-editing|collaborative_editing"
)

$basePath = "src/app/future_capabilities"

foreach ($dir in $directories) {
    $oldName, $newName = $dir.Split("|")
    $oldPath = Join-Path $basePath $oldName
    $newPath = Join-Path $basePath $newName
    
    if (Test-Path $oldPath) {
        Write-Host "Renaming $oldPath to $newPath"
        Rename-Item -Path $oldPath -NewName $newName -Force
    } else {
        Write-Host "Directory not found: $oldPath"
    }
}

Write-Host "Directory renaming complete!" 