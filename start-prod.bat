@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo [start-prod] 빌드 후 프로덕션 모드로 실행합니다.
echo.

call npm run build --prefix "%~dp0backend"
if errorlevel 1 (
  echo backend build 실패
  pause
  exit /b 1
)
call npm run build --prefix "%~dp0"
if errorlevel 1 (
  echo frontend build 실패
  pause
  exit /b 1
)

start "RS-API-PROD" cmd /k "cd /d ""%~dp0backend"" && npm run start:prod"
timeout /t 2 /nobreak >nul
start "RS-WEB-PROD" cmd /k "cd /d ""%~dp0"" && npm run start"

echo.
echo API  http://localhost:4000/api
echo WEB  http://localhost:3000
echo.
pause
