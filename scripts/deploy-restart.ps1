# Technical-Blog 프로세스 재시작 (API :4000, Web :3001)
# .env 는 건드리지 않는다.
param(
    [switch]$StopOnly,
    [string]$Root = (Split-Path $PSScriptRoot -Parent)
)

$ErrorActionPreference = 'Stop'
$node = 'C:\Program Files\nodejs\node.exe'
$backend = Join-Path $Root 'backend'
$logDir = Join-Path $backend 'logs'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Stop-Port([int]$Port) {
    Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
        Where-Object { $_.LocalPort -eq $Port } |
        ForEach-Object {
            Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        }
}

Stop-Port 4000
Stop-Port 3001
Start-Sleep -Seconds 2

if ($StopOnly) {
    Write-Host 'stopped blog ports 4000 and 3001'
    exit 0
}

Start-Process -FilePath $node -ArgumentList 'dist\main.js' -WorkingDirectory $backend -WindowStyle Hidden
Start-Process -FilePath $node -ArgumentList 'node_modules\next\dist\bin\next start -p 3001' -WorkingDirectory $Root -WindowStyle Hidden

$ok = $false
foreach ($i in 1..20) {
    Start-Sleep -Seconds 1
    try {
        $h = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4000/api/health' -TimeoutSec 2
        if ($h.StatusCode -eq 200) { $ok = $true; break }
    } catch {}
}
if (-not $ok) { throw 'API health check failed on :4000' }

$web = $false
foreach ($i in 1..15) {
    Start-Sleep -Seconds 1
    try {
        $h = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:3001/' -TimeoutSec 2
        if ($h.StatusCode -eq 200) { $web = $true; break }
    } catch {}
}
if (-not $web) { throw 'Web check failed on :3001' }

Write-Host 'blog API :4000 and web :3001 are up'
