# 포트가 비어 있으면 Technical-Blog API/Web을 띄운다.
$restart = Join-Path $PSScriptRoot 'deploy-restart.ps1'
$listen = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue
$needApi = -not ($listen | Where-Object { $_.LocalPort -eq 4000 })
$needWeb = -not ($listen | Where-Object { $_.LocalPort -eq 3001 })
if ($needApi -or $needWeb) {
    & $restart
}
