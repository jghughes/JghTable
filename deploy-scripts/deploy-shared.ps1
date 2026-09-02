# deploy-shared.ps1
# Deploys the shared framework (compiled dist/ + CSS) to $web/shared-mastercopies,
# so every app can reference it via a relative URL at runtime.
# This az CLI version has no --exclude-pattern flag, so src/ and tsconfig.json are
# skipped by only uploading dist/ and *.css explicitly (rather than the whole folder).
$ErrorActionPreference = "Stop"

$storageAccount = "customerzsun"
$container = "`$web"
$repoRoot = Split-Path -Parent $PSScriptRoot
$sourceFolder = Join-Path $repoRoot "shared-mastercopies"
$targetPath = "shared-mastercopies"

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

Write-Host "Deploying shared-mastercopies to Azure Blob Storage..." -ForegroundColor Cyan

Invoke-UploadBatch -Source (Join-Path $sourceFolder "dist") -Destination "$container/$targetPath/dist" -Pattern '*'
Invoke-UploadBatch -Source $sourceFolder -Destination "$container/$targetPath" -Pattern '*.css'

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "URL: https://$storageAccount.blob.core.windows.net/`$web/$targetPath/base-grid.css" -ForegroundColor Yellow
