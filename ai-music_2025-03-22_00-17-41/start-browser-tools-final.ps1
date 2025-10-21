# This is a comprehensive script to fix all potential issues with browser tools

# Kill any existing processes on relevant ports
Write-Host "Stopping any existing processes on ports 3025 and 8090..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3025 -ErrorAction SilentlyContinue | ForEach-Object { 
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue 
}
Get-NetTCPConnection -LocalPort 8090 -ErrorAction SilentlyContinue | ForEach-Object { 
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue 
}
Start-Sleep -Seconds 2

# Make sure we have the right packages installed
Write-Host "Installing required packages..." -ForegroundColor Cyan
npm uninstall -g @agentdeskai/browser-tools-mcp @agentdeskai/browser-tools-server
npm install -g @agentdeskai/browser-tools-mcp@1.0.11
npm install -g @agentdeskai/browser-tools-server
Start-Sleep -Seconds 2

# Update MCP config
Write-Host "Updating MCP configuration..." -ForegroundColor Cyan
$mcpConfig = @{
    mcpServers = @{
        "browser-tools" = @{
            command = "npx"
            args = @("-y", "@agentdeskai/browser-tools-mcp@1.0.11")
        }
    }
}
$mcpConfigJson = $mcpConfig | ConvertTo-Json -Depth 10
New-Item -Path ".\.cursor" -ItemType Directory -Force | Out-Null
Set-Content -Path ".\.cursor\mcp.json" -Value $mcpConfigJson -Force

# Start both servers just to be sure
Write-Host "Starting browser tools..." -ForegroundColor Green
Write-Host "1. Starting browser-tools-mcp on default port..." -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `"npx -y @agentdeskai/browser-tools-mcp@1.0.11`"" -WindowStyle Normal

Write-Host "2. Starting browser-tools-server on port 8090..." -ForegroundColor Green
$env:PORT = "8090"
Start-Process -FilePath "powershell" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `"npx @agentdeskai/browser-tools-server`"" -WindowStyle Normal

Write-Host "Done! Now please restart Cursor completely." -ForegroundColor Magenta 