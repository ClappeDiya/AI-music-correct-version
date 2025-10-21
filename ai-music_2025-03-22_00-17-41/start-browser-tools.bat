@echo off
echo Stopping any existing browser tools processes...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3025') DO taskkill /F /PID %%P 2>nul
timeout /t 2

echo Starting Browser Tools Server with MCP integration...
npx -y @agentdeskai/browser-tools-mcp@latest 