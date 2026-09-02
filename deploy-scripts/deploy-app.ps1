# deploy-app.ps1
# Deploys a single app folder (dist/ + static assets) to $web/<app-folder-name>.
# Run deploy-shared.ps1 at least once first (and after any shared framework change).
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet(
        "dirt racing series 2026",
        "wtrl zrl league 2025-6",
        "zsun club - curve fit data",
        "zsun club - membership"
    )]
    [string]$App
)

$ErrorActionPreference = "Stop"

$storageAccount = "customerzsun"
$container = "`$web"
$repoRoot = Split-Path -Parent $PSScriptRoot
$sourceFolder = Join-Path $repoRoot $App

function Invoke-UploadBatch {
    param([string]$Source, [string]$Destination, [string]$Pattern)

    az storage blob upload-batch `
        --account-name $storageAccount `
        --destination $Destination `
        --source $Source `
        --pattern $Pattern `
        --content-cache-control "no-cache" `
        --overwrite `
        --only-show-errors

    if ($LASTEXITCODE -ne 0) {
        throw "az storage blob upload-batch failed (source='$Source', pattern='$Pattern') with exit code $LASTEXITCODE"
    }
}

Write-Host "Deploying '$App' to Azure Blob Storage..." -ForegroundColor Cyan

# This az CLI version has no --exclude-pattern flag, so src/ and tsconfig.json are
# skipped by only uploading dist/, *.html, and *.css explicitly.
Invoke-UploadBatch -Source (Join-Path $sourceFolder "dist") -Destination "$container/$App/dist" -Pattern '*'
Invoke-UploadBatch -Source $sourceFolder -Destination "$container/$App" -Pattern '*.html'
Invoke-UploadBatch -Source $sourceFolder -Destination "$container/$App" -Pattern '*.css'

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "URL: https://$storageAccount.blob.core.windows.net/`$web/$App/index.html" -ForegroundColor Yellow
