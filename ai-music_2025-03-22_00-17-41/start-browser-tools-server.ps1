# Stop any existing processes using ports
Write-Host "Stopping any existing browser tools processes..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3025 -ErrorAction SilentlyContinue | ForEach-Object { 
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue 
}
Get-NetTCPConnection -LocalPort 8090 -ErrorAction SilentlyContinue | ForEach-Object { 
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue 
}
Start-Sleep -Seconds 2

# Start the browser tools server on a different port
Write-Host "Starting Browser Tools Server on port 8090..." -ForegroundColor Green
$env:PORT = "8090"
Start-Process -FilePath "powershell" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `"npx @agentdeskai/browser-tools-server`"" -WindowStyle Normal 