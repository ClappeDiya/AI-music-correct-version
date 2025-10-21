# File System Watcher for Local Git Backup
param(
    [string]$RepoPath = "C:\Md\Roo- Cline\ai-music"
)

# Function to log messages
function Write-Log {
    param($Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message"
    Add-Content -Path "$RepoPath\backup_log.txt" -Value "[$timestamp] $Message"
}

# Function to create backup
function New-LocalBackup {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $branchName = "local-backup/$timestamp"
    
    # Check if there are changes
    $changes = git -C $RepoPath status --porcelain
    if (-not $changes) {
        Write-Log "No changes detected. Skipping backup."
        return
    }
    
    # Create new branch
    git -C $RepoPath checkout -b $branchName
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Created new branch: $branchName"
        
        # Stage and commit changes
        git -C $RepoPath add -A
        $commitMessage = "Local backup $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git -C $RepoPath commit -m $commitMessage
        
        Write-Log "Changes committed to local branch: $branchName"
    }
    else {
        Write-Log "Failed to create branch: $branchName"
    }
}

# Initialize Git repository if needed
if (-not (Test-Path "$RepoPath\.git")) {
    Write-Log "Initializing local git repository..."
    git -C $RepoPath init
    git -C $RepoPath branch -M main
    
    # Initial commit
    git -C $RepoPath add -A
    git -C $RepoPath commit -m "Initial commit"
}

# Create and configure FileSystemWatcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $RepoPath
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# Define save events to monitor
$writeAction = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    # Ignore changes to .git directory and backup_log.txt
    if ($path -like "*\.git\*" -or $path -like "*\backup_log.txt") {
        return
    }
    
    Write-Log "Change detected: $changeType - $path"
    Start-Sleep -Seconds 2  # Wait for file to be fully saved
    New-LocalBackup
}

# Register event handlers
$handlers = . {
    Register-ObjectEvent -InputObject $watcher -EventName Changed -Action $writeAction
    Register-ObjectEvent -InputObject $watcher -EventName Created -Action $writeAction
}

Write-Log "Started monitoring for file changes in $RepoPath"
Write-Log "Press Ctrl+C to stop monitoring"

try {
    # Keep the script running
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    # Clean up
    $handlers | ForEach-Object {
        Unregister-Event -SourceIdentifier $_.Name
    }
    $watcher.Dispose()
    Write-Log "Stopped monitoring for file changes"
}
