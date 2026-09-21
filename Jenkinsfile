pipeline {
    agent any

    options {
        timestamps()
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    environment {
        DEPLOY_ROOT = 'C:\\deploy\\blog'
        NODE_DIR = 'C:\\Program Files\\nodejs'
        NEXT_TELEMETRY_DISABLED = '1'
        NEXT_PUBLIC_API_URL = '/api'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Build') {
            steps {
                dir('backend') {
                    powershell '''
                        $ErrorActionPreference = "Continue"
                        $env:Path = "$env:NODE_DIR;" + $env:Path
                        Write-Host "===== Backend Build ====="
                        node -v
                        npm -v
                        npm install --no-fund --no-audit
                        if ($LASTEXITCODE -ne 0) { exit 1 }
                        npm run build
                        if ($LASTEXITCODE -ne 0) { exit 1 }
                        if (-not (Test-Path "dist\\main.js")) {
                            throw "backend dist/main.js missing"
                        }
                    '''
                }
            }
        }

        stage('Frontend Build') {
            steps {
                powershell '''
                    $ErrorActionPreference = "Continue"
                    $env:Path = "$env:NODE_DIR;" + $env:Path
                    Write-Host "===== Frontend Build ====="
                    npm install --no-fund --no-audit
                    if ($LASTEXITCODE -ne 0) { exit 1 }
                    npm run build
                    if ($LASTEXITCODE -ne 0) { exit 1 }
                    if (-not (Test-Path ".next")) {
                        throw ".next missing after frontend build"
                    }
                '''
            }
        }

        stage('Stop running app') {
            steps {
                powershell '''
                    $ErrorActionPreference = "Continue"
                    cmd /c "C:\\nssm\\nssm.exe stop blog-backend"
                    cmd /c "C:\\nssm\\nssm.exe stop blog-frontend"
                    & "$env:WORKSPACE\\scripts\\deploy-restart.ps1" -StopOnly
                    exit 0
                '''
            }
        }

        stage('Copy to deploy') {
            steps {
                powershell '''
                    $ErrorActionPreference = "Continue"
                    $ws = $env:WORKSPACE
                    $deploy = $env:DEPLOY_ROOT
                    $backend = Join-Path $deploy "backend"
                    New-Item -ItemType Directory -Force -Path $backend | Out-Null
                    New-Item -ItemType Directory -Force -Path (Join-Path $deploy "scripts") | Out-Null
                    New-Item -ItemType Directory -Force -Path (Join-Path $backend "logs") | Out-Null

                    if (-not (Test-Path (Join-Path $backend ".env"))) {
                        throw "C:\\deploy\\blog\\backend\\.env missing — secrets stay on server, never from git"
                    }

                    function Copy-Tree($src, $dst) {
                        if (-not (Test-Path $src)) { throw "missing $src" }
                        New-Item -ItemType Directory -Force -Path $dst | Out-Null
                        robocopy $src $dst /E /NFL /NDL /NJH /NJS /nc /ns /np
                        if ($LASTEXITCODE -ge 8) { throw "robocopy failed $src -> $dst ($LASTEXITCODE)" }
                        $global:LASTEXITCODE = 0
                    }

                    Write-Host "===== Copy backend runtime ====="
                    Copy-Tree (Join-Path $ws "backend\\dist") (Join-Path $backend "dist")
                    Copy-Tree (Join-Path $ws "backend\\node_modules") (Join-Path $backend "node_modules")
                    Copy-Item (Join-Path $ws "backend\\package.json") (Join-Path $backend "package.json") -Force
                    $lock = Join-Path $ws "backend\\package-lock.json"
                    if (Test-Path $lock) {
                        Copy-Item $lock (Join-Path $backend "package-lock.json") -Force
                    }

                    Write-Host "===== Copy frontend runtime ====="
                    Copy-Tree (Join-Path $ws ".next") (Join-Path $deploy ".next")
                    Copy-Tree (Join-Path $ws "node_modules") (Join-Path $deploy "node_modules")
                    $public = Join-Path $ws "public"
                    if (Test-Path $public) {
                        Copy-Tree $public (Join-Path $deploy "public")
                    }
                    foreach ($f in @("package.json","package-lock.json","next.config.ts","next.config.js","tsconfig.json")) {
                        $p = Join-Path $ws $f
                        if (Test-Path $p) { Copy-Item $p (Join-Path $deploy $f) -Force }
                    }
                    Copy-Tree (Join-Path $ws "scripts") (Join-Path $deploy "scripts")

                    Write-Host "env files preserved"
                    exit 0
                '''
            }
        }

        stage('Restart') {
            steps {
                powershell '''
                    $ErrorActionPreference = "Continue"
                    $nssm = "C:\\nssm\\nssm.exe"
                    $node = "C:\\Program Files\\nodejs\\node.exe"
                    $root = $env:DEPLOY_ROOT
                    $backend = Join-Path $root "backend"
                    $logs = Join-Path $backend "logs"
                    New-Item -ItemType Directory -Force -Path $logs | Out-Null

                    & cmd /c "`"$nssm`" set blog-backend Application `"$node`""
                    & cmd /c "`"$nssm`" set blog-backend AppDirectory `"$backend`""
                    & cmd /c "`"$nssm`" set blog-backend AppParameters dist\\main.js"
                    & cmd /c "`"$nssm`" set blog-backend AppStdout `"$logs\\nssm-backend-stdout.log`""
                    & cmd /c "`"$nssm`" set blog-backend AppStderr `"$logs\\nssm-backend-stderr.log`""

                    & cmd /c "`"$nssm`" set blog-frontend Application `"$node`""
                    & cmd /c "`"$nssm`" set blog-frontend AppDirectory `"$root`""
                    & cmd /c "`"$nssm`" set blog-frontend AppParameters `"node_modules\\next\\dist\\bin\\next start -p 3001`""
                    & cmd /c "`"$nssm`" set blog-frontend AppStdout `"$logs\\nssm-frontend-stdout.log`""
                    & cmd /c "`"$nssm`" set blog-frontend AppStderr `"$logs\\nssm-frontend-stderr.log`""

                    & cmd /c "`"$nssm`" restart blog-backend"
                    & cmd /c "`"$nssm`" restart blog-frontend"

                    $ok = $false
                    foreach ($i in 1..25) {
                        Start-Sleep -Seconds 2
                        try {
                            $h = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:4000/api/health" -TimeoutSec 2
                            if ($h.StatusCode -eq 200) { $ok = $true; break }
                        } catch {}
                    }
                    if (-not $ok) { throw "API health check failed on :4000" }

                    $web = $false
                    foreach ($i in 1..15) {
                        Start-Sleep -Seconds 2
                        try {
                            $h = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:3001/" -TimeoutSec 2
                            if ($h.StatusCode -eq 200) { $web = $true; break }
                        } catch {}
                    }
                    if (-not $web) { throw "Web check failed on :3001" }

                    Write-Host "NSSM blog-backend / blog-frontend are up"
                    cmd /c "C:\nssm\nssm.exe status blog-backend"
                    cmd /c "C:\nssm\nssm.exe status blog-frontend"
                    exit 0
                '''
            }
        }
    }

    post {
        success {
            echo 'study.rjsgud.com deploy SUCCESS'
        }
        failure {
            echo 'study.rjsgud.com deploy FAILED'
        }
    }
}
