@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion

REM ============================================================
REM  React Structure - Windows 서버 원클릭 세팅
REM  위치: 프로젝트 루트에서 실행 (setup.bat 더블클릭 또는 cmd)
REM ============================================================

cd /d "%~dp0"

set "ROOT=%CD%"
set "BACKEND=%ROOT%\backend"
set "SCRIPTS=%ROOT%\scripts"
set "ERR=0"

REM ---- 기본값 (세팅.md 에서 변경 안내) ----
set "DB_HOST=localhost"
set "DB_PORT=3306"
set "DB_USER=root"
set "DB_PASSWORD=password"
set "DB_NAME=react_structure"
set "API_PORT=4000"
set "WEB_PORT=3000"
set "JWT_SECRET=dev-change-me-react-structure"
set "ADMIN_USER=rjsgud"
set "ADMIN_PASS=rjsgud123"

echo.
echo ============================================================
echo   React Structure Windows Setup
echo   ROOT: %ROOT%
echo ============================================================
echo.

REM ============================================================
REM  1) Node.js
REM ============================================================
echo [1/7] Node.js 확인...
where node >nul 2>&1
if errorlevel 1 (
  echo   [!] node 가 PATH 에 없습니다.
  where winget >nul 2>&1
  if not errorlevel 1 (
    echo   winget 으로 Node.js LTS 설치를 시도합니다...
    winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  ) else (
    echo   [X] winget 도 없습니다. https://nodejs.org 에서 LTS 설치 후 다시 실행하세요.
    set "ERR=1"
    goto :SUMMARY
  )
  where node >nul 2>&1
  if errorlevel 1 (
    echo   [X] Node 설치 후에도 PATH 에 없습니다. 터미널을 새로 열고 다시 실행하세요.
    set "ERR=1"
    goto :SUMMARY
  )
)
for /f "tokens=*" %%v in ('node -v') do echo   OK node %%v
for /f "tokens=*" %%v in ('npm -v') do echo   OK npm %%v
echo.

REM ============================================================
REM  2) MySQL 클라이언트 찾기
REM ============================================================
echo [2/7] MySQL 클라이언트 확인...
set "MYSQL_EXE="

where mysql >nul 2>&1
if not errorlevel 1 (
  for /f "delims=" %%i in ('where mysql') do (
    if not defined MYSQL_EXE set "MYSQL_EXE=%%i"
  )
)

if not defined MYSQL_EXE if exist "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" set "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
if not defined MYSQL_EXE if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" set "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if not defined MYSQL_EXE if exist "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe" set "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe"
if not defined MYSQL_EXE if exist "C:\xampp\mysql\bin\mysql.exe" set "MYSQL_EXE=C:\xampp\mysql\bin\mysql.exe"
if not defined MYSQL_EXE if exist "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe" set "MYSQL_EXE=C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe"

REM Laragon 버전 폴더 와일드카드
if not defined MYSQL_EXE (
  for /d %%d in ("C:\laragon\bin\mysql\mysql-*") do (
    if exist "%%d\bin\mysql.exe" set "MYSQL_EXE=%%d\bin\mysql.exe"
  )
)

if not defined MYSQL_EXE (
  echo   [!] mysql.exe 를 찾지 못했습니다.
  echo       MySQL / XAMPP / Laragon 설치 후 PATH 에 bin 을 추가하거나 세팅.md 를 보세요.
  echo       DB 생성은 건너뛰고 env / npm 설치는 계속 진행합니다.
  set "SKIP_DB=1"
) else (
  echo   OK mysql: %MYSQL_EXE%
  set "SKIP_DB=0"
)
echo.

REM ============================================================
REM  3) MySQL 서비스 기동 시도
REM ============================================================
echo [3/7] MySQL 서비스 기동 시도...
set "MYSQL_SVC="
for %%s in (MySQL80 MySQL84 MySQL57 MySQL MySQL57 MySQL80 MySQL) do (
  sc query "%%s" >nul 2>&1
  if not errorlevel 1 (
    if not defined MYSQL_SVC set "MYSQL_SVC=%%s"
  )
)
if defined MYSQL_SVC (
  echo   서비스 발견: %MYSQL_SVC%
  sc query "%MYSQL_SVC%" | findstr /I "RUNNING" >nul
  if errorlevel 1 (
    echo   시작 중...
    net start "%MYSQL_SVC%" >nul 2>&1
    if errorlevel 1 (
      echo   [!] 서비스 시작 실패 ^(관리자 권한 필요할 수 있음^)
    ) else (
      echo   OK 서비스 RUNNING
    )
  ) else (
    echo   OK 이미 RUNNING
  )
) else (
  echo   [!] MySQL Windows 서비스를 자동으로 못 찾았습니다. ^(XAMPP면 직접 Start^)
)
echo.

REM ============================================================
REM  4) 데이터베이스 생성 (비번: password → 실패 시 빈 비번 재시도)
REM ============================================================
echo [4/7] 데이터베이스 생성...
if "%SKIP_DB%"=="1" (
  echo   SKIP
  goto :ENV
)

set "DB_OK=0"

REM 시도 A: password
"%MYSQL_EXE%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% -e "SELECT 1;" >nul 2>&1
if not errorlevel 1 (
  set "DB_OK=1"
  echo   접속 OK ^(user=%DB_USER%, password=password^)
) else (
  echo   password 접속 실패 → 빈 비밀번호로 재시도...
  "%MYSQL_EXE%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -e "SELECT 1;" >nul 2>&1
  if not errorlevel 1 (
    set "DB_OK=1"
    set "DB_PASSWORD="
    echo   접속 OK ^(user=%DB_USER%, password=^<empty^>^)
  )
)

if "%DB_OK%"=="0" (
  echo   [X] MySQL 접속 실패. root 비밀번호를 확인하세요. ^(세팅.md^)
  echo       기본 시도값: password / ^(빈 문자열^)
  set "ERR=1"
) else (
  if exist "%SCRIPTS%\init-db.sql" (
    if "%DB_PASSWORD%"=="" (
      "%MYSQL_EXE%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% < "%SCRIPTS%\init-db.sql"
    ) else (
      "%MYSQL_EXE%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% < "%SCRIPTS%\init-db.sql"
    )
    if errorlevel 1 (
      echo   [X] init-db.sql 실행 실패
      set "ERR=1"
    ) else (
      echo   OK database `%DB_NAME%` 준비됨
    )
  ) else (
    if "%DB_PASSWORD%"=="" (
      "%MYSQL_EXE%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    ) else (
      "%MYSQL_EXE%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    )
    echo   OK database 생성 명령 실행
  )
)
echo.

REM ============================================================
REM  5) 환경변수 파일 생성
REM ============================================================
:ENV
echo [5/7] .env 파일 생성...

REM backend\.env
if exist "%BACKEND%\.env" (
  echo   backend\.env 이미 있음 → 유지
) else (
  (
    echo PORT=%API_PORT%
    echo CORS_ORIGIN=http://localhost:%WEB_PORT%
    echo.
    echo DB_HOST=%DB_HOST%
    echo DB_PORT=%DB_PORT%
    echo DB_USER=%DB_USER%
    echo DB_PASSWORD=%DB_PASSWORD%
    echo DB_NAME=%DB_NAME%
    echo DB_SYNC=true
    echo.
    echo JWT_SECRET=%JWT_SECRET%
    echo JWT_EXPIRES_IN=7d
    echo.
    echo SEED_ADMIN_USERNAME=%ADMIN_USER%
    echo SEED_ADMIN_PASSWORD=%ADMIN_PASS%
    echo SEED_ADMIN_DISPLAY_NAME=%ADMIN_USER%
  ) > "%BACKEND%\.env"
  echo   OK backend\.env 생성
)

REM 프론트 .env.local ^(Nest API 연동^)
if exist "%ROOT%\.env.local" (
  echo   .env.local 이미 있음 → 유지
) else (
  (
    echo NEXT_PUBLIC_DATA_SOURCE=api
    echo NEXT_PUBLIC_API_URL=http://localhost:%API_PORT%/api
  ) > "%ROOT%\.env.local"
  echo   OK .env.local 생성 ^(DATA_SOURCE=api^)
)
echo.

REM ============================================================
REM  6) npm install
REM ============================================================
echo [6/7] npm install (web + api)...
call npm install --prefix "%ROOT%"
if errorlevel 1 (
  echo   [X] 프론트 npm install 실패
  set "ERR=1"
) else (
  echo   OK 프론트 dependencies
)

if not exist "%BACKEND%\package.json" (
  echo   [X] backend 폴더가 없습니다.
  set "ERR=1"
) else (
  call npm install --prefix "%BACKEND%"
  if errorlevel 1 (
    echo   [X] 백엔드 npm install 실패
    set "ERR=1"
  ) else (
    echo   OK 백엔드 dependencies
  )
)
echo.

REM ============================================================
REM  7) 빌드 (선택적 실패 허용 — 개발 모드로도 실행 가능)
REM ============================================================
echo [7/7] 프로덕션 빌드 시도...
call npm run build --prefix "%BACKEND%"
if errorlevel 1 (
  echo   [!] backend build 실패 — npm run start:dev 로 개발 실행은 가능합니다.
) else (
  echo   OK backend build
)

call npm run build --prefix "%ROOT%"
if errorlevel 1 (
  echo   [!] frontend build 실패 — npm run dev 로 개발 실행은 가능합니다.
) else (
  echo   OK frontend build
)
echo.

REM ============================================================
REM  실행 안내 / 옵션
REM ============================================================
:SUMMARY
echo ============================================================
if "%ERR%"=="1" (
  echo   세팅 중 일부 오류가 있었습니다. 세팅.md 를 확인하세요.
) else (
  echo   세팅 완료.
)
echo.
echo   관리자 계정 ^(시드^): %ADMIN_USER% / %ADMIN_PASS%
echo   DB: %DB_USER%@%DB_HOST%:%DB_PORT%/%DB_NAME%
echo   API: http://localhost:%API_PORT%/api/health
echo   WEB: http://localhost:%WEB_PORT%
echo.
echo   개발 실행:
echo     1^) cd backend ^&^& npm run start:dev
echo     2^) ^(다른 창^) npm run dev
echo   또는 start-dev.bat 사용
echo.
echo   수동으로 바꿔야 할 값 → 세팅.md
echo ============================================================
echo.

set /p START_NOW="지금 개발 서버를 실행할까요? (API+WEB) [Y/N]: "
if /i "%START_NOW%"=="Y" (
  if exist "%ROOT%\start-dev.bat" (
    call "%ROOT%\start-dev.bat"
  ) else (
    echo start-dev.bat 이 없습니다. 수동으로 실행하세요.
  )
)

echo.
pause
endlocal
exit /b %ERR%
