# deploy-all.ps1
#Requires -Version 7.0
# Orchestrates deployment of the shared framework and each app, but leaves all build,
# clean, validation, and upload work to the individual deployment scripts.
[CmdletBinding()]
param(
    [string]$StorageAccountName = "customerzsun",
    [string]$ResourceGroupName = ""
)

$ErrorActionPreference = "Stop"

$scriptDir = $PSScriptRoot
$apps = @(
    "dirt racing series 2026",
    "wtrl zrl league 2025-6",
    "zsun club - curve fit data",
    "zsun club - membership"
)

Write-Host "Deploying shared framework..." -ForegroundColor Cyan
& (Join-Path $scriptDir "deploy-shared.ps1") -StorageAccountName $StorageAccountName -ResourceGroupName $ResourceGroupName

foreach ($app in $apps) {
    Write-Host "`nDeploying app: $app..." -ForegroundColor Cyan
    & (Join-Path $scriptDir "deploy-app.ps1") -App $app -StorageAccountName $StorageAccountName -ResourceGroupName $ResourceGroupName
}

Write-Host "`nAll deployments complete!" -ForegroundColor Green
