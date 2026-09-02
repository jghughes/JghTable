# deploy-all.ps1
# Builds everything, then deploys shared-mastercopies and all 4 apps in order.
$ErrorActionPreference = "Stop"

$scriptDir = $PSScriptRoot
$repoRoot = Split-Path -Parent $scriptDir

Write-Host "Building all projects..." -ForegroundColor Cyan
Push-Location $repoRoot
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed - aborting deployment"
    }
}
finally {
    Pop-Location
}

& (Join-Path $scriptDir "deploy-shared.ps1")

$apps = @(
    "dirt racing series 2026",
    "wtrl zrl league 2025-6",
    "zsun club - curve fit data",
    "zsun club - membership"
)

foreach ($app in $apps) {
    & (Join-Path $scriptDir "deploy-app.ps1") -App $app
}

Write-Host "`nAll deployments complete!" -ForegroundColor Green
