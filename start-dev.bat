@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo [start-dev] Nest API + Next Web 을 새 창에서 실행합니다.
echo.

start "RS-API" cmd /k "cd /d ""%~dp0backend"" && npm run start:dev"
timeout /t 3 /nobreak >nul
start "RS-WEB" cmd /k "cd /d ""%~dp0"" && npm run dev"

echo.
echo API  http://localhost:4000/api/health
echo WEB  http://localhost:3000
echo LOGIN  backend/.env 의 SEED_ADMIN_* (소스에 비밀번호 없음)
echo.
pause
