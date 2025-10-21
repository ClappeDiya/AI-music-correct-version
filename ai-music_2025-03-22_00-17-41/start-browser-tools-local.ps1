# Stop any existing processes using port 3025
Write-Host "Stopping any existing browser tools processes..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3025 -ErrorAction SilentlyContinue | ForEach-Object { 
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue 
}
Start-Sleep -Seconds 2

# Start the browser tools MCP with debugging
Write-Host "Starting locally installed Browser Tools with debugging..." -ForegroundColor Green
$env:DEBUG = "browser-tools*"
node ./node_modules/@agentdeskai/browser-tools-mcp/dist/index.js 