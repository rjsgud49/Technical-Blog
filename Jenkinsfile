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
                    & "$env:WORKSPACE\\scripts\\deploy-restart.ps1" -StopOnly
                    if ($LASTEXITCODE -ne 0) { exit 1 }
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
                '''
            }
        }

        stage('Restart') {
            steps {
                powershell '''
                    $ErrorActionPreference = "Continue"
                    & "$env:DEPLOY_ROOT\\scripts\\deploy-restart.ps1"
                    if ($LASTEXITCODE -ne 0) { exit 1 }
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
