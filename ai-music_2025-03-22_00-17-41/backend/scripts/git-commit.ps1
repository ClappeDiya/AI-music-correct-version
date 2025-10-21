# git-commit.ps1
# .\git-commit.ps1
# Function to check if git is initialized
function Check-GitInitialized {
    if (-not (Test-Path .git)) {
        Write-Host "Git repository not initialized. Initializing now..."
        git init
        return $false
    }
    return $true
}

# Function to check if remote exists
function Check-Remote {
    $remote = git remote
    if ($remote -notcontains "origin") {
        Write-Host "Remote 'origin' not found. Please enter your Bitbucket repository URL:"
        $repo_url = Read-Host
        git remote add origin $repo_url
        Write-Host "Remote 'origin' added successfully!"
    }
}

# Function to create branch name
function Create-BranchName {
    param($description)
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    return "feature/${timestamp}_$($description -replace '\s+', '_')"
}

# Function to commit changes
function Commit-Changes {
    param($commit_message, $branch_name)
    
    # Create and checkout new branch
    git checkout -b $branch_name

    # Add all changes
    git add .

    # Commit changes with properly quoted message
    git commit -m "`"$commit_message`""

    # Push to remote with branch
    git push -u origin $branch_name
}

# Main script execution
function Main {
    # Check if git is initialized
    Check-GitInitialized

    # Check if remote exists
    Check-Remote

    # Get commit message from user
    Write-Host "Enter commit message:"
    $commit_message = Read-Host

    # Get branch description from user
    Write-Host "Enter brief branch description (will be part of branch name):"
    $branch_description = Read-Host

    # Create branch name
    $branch_name = Create-BranchName $branch_description

    # Perform commit and push
    Commit-Changes $commit_message $branch_name

    Write-Host "Changes committed and pushed to branch: $branch_name"
}

# Execute main function
Main