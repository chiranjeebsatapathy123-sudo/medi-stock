@echo off
title MediStock Pro - Server Launcher
cd /d "%~dp0.."

echo =================================================================
echo   STARTING MEDISTOCK PRO ENTERPRISE SERVERS
echo =================================================================

if not defined JAVA_HOME (
    if exist "C:\Program Files\Java\jdk-25.0.2" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-25.0.2"
    )
)

echo [1/2] Launching Spring Boot Backend on http://localhost:8080...
start "MediStock Backend" cmd /k "cd backend && mvnw.cmd spring-boot:run"

echo [2/2] Launching Vite Frontend on http://localhost:5173...
start "MediStock Frontend" cmd /k "npm run dev"

echo.
echo Servers successfully launched in separate windows!
echo   - Frontend Web UI:    http://localhost:5173
echo   - Backend REST API:   http://localhost:8080/api
echo   - Health Diagnostics: http://localhost:8080/api/health
echo   - Swagger OpenAPI:    http://localhost:8080/swagger-ui.html
echo.
pause

