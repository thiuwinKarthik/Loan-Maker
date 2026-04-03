param(
    [switch]$SkipInstall,
    [switch]$SkipQdrant
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
    Write-Host "`n==> $msg" -ForegroundColor Cyan
}

function Test-Command($name) {
    return $null -ne (Get-Command $name -ErrorAction SilentlyContinue)
}

function Require-Command($name, $hint) {
    if (-not (Test-Command $name)) {
        Write-Host "Missing required command: $name" -ForegroundColor Red
        Write-Host "Install hint: $hint" -ForegroundColor Yellow
        exit 1
    }
}

$root = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root "frontend"
$backend = Join-Path $root "backend"
$ai = Join-Path $root "AI\loanmaker-ai"

Write-Step "Validating prerequisites"
Require-Command "node" "Install Node.js 20+ from https://nodejs.org"
Require-Command "npm" "Install Node.js 20+ from https://nodejs.org"
Require-Command "python" "Install Python 3.11+ from https://python.org"
Require-Command "java" "Install JDK 21 from https://adoptium.net"
Require-Command "mvn" "Install Maven 3.9+ and add to PATH"

if (-not $SkipQdrant) {
    Require-Command "docker" "Install Docker Desktop from https://www.docker.com/products/docker-desktop/"
}

Write-Step "Checking environment example files"
$envFiles = @(
    (Join-Path $frontend ".env.example"),
    (Join-Path $backend ".env.example"),
    (Join-Path $ai ".env.example")
)
foreach ($file in $envFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "Missing file: $file" -ForegroundColor Red
        exit 1
    }
}

Write-Step "Creating local .env files when missing"
$envPairs = @(
    @{ Example = (Join-Path $frontend ".env.example"); Target = (Join-Path $frontend ".env") },
    @{ Example = (Join-Path $backend ".env.example"); Target = (Join-Path $backend ".env") },
    @{ Example = (Join-Path $ai ".env.example"); Target = (Join-Path $ai ".env") }
)
foreach ($pair in $envPairs) {
    if (-not (Test-Path $pair.Target)) {
        Copy-Item $pair.Example $pair.Target
        Write-Host "Created: $($pair.Target)" -ForegroundColor Green
    }
}

if (-not $SkipQdrant) {
    Write-Step "Starting Qdrant via docker compose"
    docker compose -f (Join-Path $root "docker-compose.rag.yml") up -d
}

if (-not $SkipInstall) {
    Write-Step "Installing frontend dependencies"
    Push-Location $frontend
    npm install
    Pop-Location

    Write-Step "Installing backend dependencies"
    Push-Location $backend
    mvn -q -DskipTests clean install
    Pop-Location

    Write-Step "Installing AI dependencies"
    Push-Location $ai
    if (-not (Test-Path ".venv")) {
        python -m venv .venv
    }
    & ".\.venv\Scripts\python.exe" -m pip install --upgrade pip
    & ".\.venv\Scripts\python.exe" -m pip install -r requirements.txt
    Pop-Location
}

Write-Step "Running vector ingestion seed job"
Push-Location $ai
& ".\.venv\Scripts\python.exe" jobs/ingest_vectors.py
Pop-Location

Write-Step "Bootstrap complete"
Write-Host ""
Write-Host "Start services in 3 terminals:" -ForegroundColor Yellow
Write-Host "1) AI     : cd `"$ai`" ; .\.venv\Scripts\activate ; uvicorn main:app --reload --port 8000"
Write-Host "2) Backend: cd `"$backend`" ; mvn spring-boot:run"
Write-Host "3) Frontend: cd `"$frontend`" ; npm run dev"
Write-Host ""
Write-Host "Also ensure MySQL database 'loan_maker' exists and SQL migrations were applied from scripts/migrations." -ForegroundColor Yellow
