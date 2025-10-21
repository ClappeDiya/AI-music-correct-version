# Project Backup Script - Direct Copy Version
# Save this as backup-project.ps1 in a convenient location

# Get current date and time in a filename-friendly format
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = "$env:USERPROFILE\Desktop\backup_log_$timestamp.txt"

# Define source and destination paths
$sourceProjectPath = "C:\Md\Roo- Cline\ai-music"
$sourceFrontendPath = "C:\Md\Roo- Cline\ai-music\frontend"
$sourceBackendPath = "C:\Md\Roo- Cline\ai-music\backend"
$backupsFolder = "C:\Md\Roo- Cline\project-backups"
$destinationPath = "$backupsFolder\ai-music_$timestamp"
$destinationFrontendPath = "$destinationPath\frontend"
$destinationBackendPath = "$destinationPath\backend"

# Start logging
Start-Transcript -Path $logFile

Write-Host "===== PROJECT BACKUP SCRIPT =====" -ForegroundColor Cyan
Write-Host "Source project: $sourceProjectPath" -ForegroundColor Cyan
Write-Host "Frontend source: $sourceFrontendPath" -ForegroundColor Cyan
Write-Host "Backend source: $sourceBackendPath" -ForegroundColor Cyan
Write-Host "Destination: $destinationPath" -ForegroundColor Cyan
Write-Host "Timestamp: $timestamp" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Create backups folder if it doesn't exist
if (!(Test-Path -Path $backupsFolder)) {
    New-Item -ItemType Directory -Path $backupsFolder -Force | Out-Null
    Write-Host "Created backups folder at $backupsFolder" -ForegroundColor Green
}

# Create destination folder structure
New-Item -ItemType Directory -Path $destinationPath -Force | Out-Null
New-Item -ItemType Directory -Path $destinationFrontendPath -Force | Out-Null
New-Item -ItemType Directory -Path $destinationBackendPath -Force | Out-Null

Write-Host "Created destination folders" -ForegroundColor Green

# Function to check directory existence and content
function Test-DirectoryContent {
    param (
        [string]$Path,
        [string]$Name
    )
    
    if (Test-Path -Path $Path) {
        $fileCount = (Get-ChildItem -Path $Path -Recurse -File).Count
        $dirCount = (Get-ChildItem -Path $Path -Recurse -Directory).Count
        Write-Host "$Name directory exists with $fileCount files in $dirCount folders" -ForegroundColor Green
        return $true
    } else {
        Write-Host "$Name directory not found at $Path" -ForegroundColor Red
        return $false
    }
}

# Check source directories
$frontendExists = Test-DirectoryContent -Path $sourceFrontendPath -Name "Frontend source"
$backendExists = Test-DirectoryContent -Path $sourceBackendPath -Name "Backend source"

if (-not ($frontendExists -and $backendExists)) {
    Write-Host "ERROR: Source directories missing! Check paths and try again." -ForegroundColor Red
    Stop-Transcript
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

try {
    # Copy root project files (excluding frontend and backend directories)
    Write-Host "Copying root project files..." -ForegroundColor Cyan
    Get-ChildItem -Path $sourceProjectPath -Exclude "frontend", "backend" | 
        ForEach-Object {
            if ($_ -is [System.IO.DirectoryInfo]) {
                Copy-Item -Path $_.FullName -Destination "$destinationPath\$($_.Name)" -Recurse -Force
            } else {
                Copy-Item -Path $_.FullName -Destination "$destinationPath\$($_.Name)" -Force
            }
        }
    
    # Copy frontend directory
    Write-Host "Copying frontend directory contents..." -ForegroundColor Cyan
    robocopy "$sourceFrontendPath" "$destinationFrontendPath" /E /COPY:DAT /NP /R:1 /W:1
    
    if ($LASTEXITCODE -ge 8) {
        Write-Host "Error copying frontend directory (Robocopy exit code: $LASTEXITCODE)" -ForegroundColor Red
    } else {
        Write-Host "Frontend directory copied successfully" -ForegroundColor Green
    }
    
    # Copy backend directory
    Write-Host "Copying backend directory contents..." -ForegroundColor Cyan
    robocopy "$sourceBackendPath" "$destinationBackendPath" /E /COPY:DAT /NP /R:1 /W:1
    
    if ($LASTEXITCODE -ge 8) {
        Write-Host "Error copying backend directory (Robocopy exit code: $LASTEXITCODE)" -ForegroundColor Red
    } else {
        Write-Host "Backend directory copied successfully" -ForegroundColor Green
    }
    
    # Verify the copy operation
    Write-Host "Verifying copy operation..." -ForegroundColor Cyan
    
    # Verify frontend
    $destFrontendExists = Test-DirectoryContent -Path $destinationFrontendPath -Name "Destination frontend"
    if ($destFrontendExists) {
        $sourceFrontendFiles = (Get-ChildItem -Path $sourceFrontendPath -Recurse -File).Count
        $destFrontendFiles = (Get-ChildItem -Path $destinationFrontendPath -Recurse -File).Count
        
        if ($destFrontendFiles -ge $sourceFrontendFiles) {
            Write-Host "VERIFICATION PASSED: Frontend directory copy is complete" -ForegroundColor Green
            Write-Host "Source files: $sourceFrontendFiles, Destination files: $destFrontendFiles" -ForegroundColor Green
        } else {
            Write-Host "VERIFICATION WARNING: Frontend directory may be incomplete" -ForegroundColor Yellow
            Write-Host "Source files: $sourceFrontendFiles, Destination files: $destFrontendFiles" -ForegroundColor Yellow
        }
    }
    
    # Verify backend
    $destBackendExists = Test-DirectoryContent -Path $destinationBackendPath -Name "Destination backend"
    if ($destBackendExists) {
        $sourceBackendFiles = (Get-ChildItem -Path $sourceBackendPath -Recurse -File).Count
        $destBackendFiles = (Get-ChildItem -Path $destinationBackendPath -Recurse -File).Count
        
        if ($destBackendFiles -ge $sourceBackendFiles) {
            Write-Host "VERIFICATION PASSED: Backend directory copy is complete" -ForegroundColor Green
            Write-Host "Source files: $sourceBackendFiles, Destination files: $destBackendFiles" -ForegroundColor Green
        } else {
            Write-Host "VERIFICATION WARNING: Backend directory may be incomplete" -ForegroundColor Yellow
            Write-Host "Source files: $sourceBackendFiles, Destination files: $destBackendFiles" -ForegroundColor Yellow
        }
    }
    
    # Open the backup folder in File Explorer
    explorer $destinationPath
    
    Write-Host "Backup process completed. Log saved to: $logFile" -ForegroundColor Green
}
catch {
    Write-Host "Error creating backup: $_" -ForegroundColor Red
    Write-Host "See log file for details: $logFile" -ForegroundColor Red
}

# End logging
Stop-Transcript

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
