# MediStock Pro - Production Server Launcher
$RootDir = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $RootDir "backend"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  STARTING MEDISTOCK PRO ENTERPRISE SERVERS" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Set JAVA_HOME if needed
if (-not $env:JAVA_HOME -and (Test-Path "C:\Program Files\Java\jdk-25.0.2")) {
    $env:JAVA_HOME = "C:\Program Files\Java\jdk-25.0.2"
}

Write-Host "[1/2] Launching Spring Boot Backend on http://localhost:8080..." -ForegroundColor Yellow
$backendJob = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "`$env:JAVA_HOME = '$env:JAVA_HOME'; Set-Location '$BackendDir'; .\mvnw.cmd spring-boot:run" -PassThru

Write-Host "[2/2] Launching Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
$frontendJob = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "Set-Location '$RootDir'; npm run dev" -PassThru

Write-Host "`nServers launched in dedicated terminal windows!" -ForegroundColor Green
Write-Host "  - Frontend Web UI:    http://localhost:5173" -ForegroundColor Cyan
Write-Host "  - Backend REST API:   http://localhost:8080/api" -ForegroundColor Cyan
Write-Host "  - Health Diagnostics: http://localhost:8080/api/health" -ForegroundColor Cyan
Write-Host "  - Swagger OpenAPI:    http://localhost:8080/swagger-ui.html`n" -ForegroundColor Cyan

