# Periodic Local Git Backup Script
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
    $branchName = "local-periodic/$timestamp"
    
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
        $commitMessage = "Periodic backup $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
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

# Create backup
New-LocalBackup
