# Stop any existing processes using port 3025
Write-Host "Stopping any existing browser tools processes..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3025 -ErrorAction SilentlyContinue | ForEach-Object { 
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue 
}
Start-Sleep -Seconds 2

# Start the browser tools MCP
Write-Host "Starting Browser Tools Server with MCP integration..." -ForegroundColor Green
npx -y @agentdeskai/browser-tools-mcp@latest 