# Setup Scheduled Tasks for Local Git Backup
$taskName = "AI-Music-Local-Backup-Periodic"
$scriptPath = "C:\Md\Roo- Cline\ai-music\scripts\local-backup-periodic.ps1"
$watcherPath = "C:\Md\Roo- Cline\ai-music\scripts\local-backup-watcher.ps1"
$workingDir = "C:\Md\Roo- Cline\ai-music"

# Create the scheduled task action for periodic backup
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
    -Description "Periodic local Git backup for AI-Music project" `
    -RunLevel Highest `
    -Force

Write-Host "Scheduled task '$taskName' has been created successfully!"
Write-Host "The backup will run every 6 hours."

# Start the file watcher
Write-Host "Starting file watcher..."
Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$watcherPath`"" -WindowStyle Normal
