# Setup Scheduled Task for GitHub Backup
$taskName = "AI-Music-GitHub-Backup"
$scriptPath = "C:\Md\Roo- Cline\ai-music\scripts\github-backup.ps1"
$workingDir = "C:\Md\Roo- Cline\ai-music"

# Create the scheduled task action
$action = New-ScheduledTaskAction `
    -Execute "PowerShell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" `
    -WorkingDirectory $workingDir

# Create trigger (runs every 6 hours)
$trigger = New-ScheduledTaskTrigger `
    -Once `
    -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Hours 6)

# Set up task settings
$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -DontStopOnIdleEnd `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -RestartCount 3

# Register the scheduled task
Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description "Automatic GitHub backup for AI-Music project" `
    -RunLevel Highest `
    -Force

Write-Host "Scheduled task '$taskName' has been created successfully!"
Write-Host "The backup will run every 6 hours and create a new branch for changes."
