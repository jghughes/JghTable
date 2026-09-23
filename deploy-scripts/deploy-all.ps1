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
# maps each local app folder to the folder name it is published under in $web
$apps = [ordered]@{
    "dirt-racing-series"        = "dirt"
    "wtrl-zrl-league"           = "zrl"
    "zsun-club-curve-fits"      = "zsun-curve-fits"
    "zsun-club-membership"      = "zsun-membership"
}

Write-Host "Deploying shared framework..." -ForegroundColor Cyan
& (Join-Path $scriptDir "deploy-shared.ps1") -StorageAccountName $StorageAccountName -ResourceGroupName $ResourceGroupName

foreach ($app in $apps.Keys) {
    $targetFolder = $apps[$app]
    Write-Host "`nDeploying app: $app -> $targetFolder..." -ForegroundColor Cyan
    & (Join-Path $scriptDir "deploy-app.ps1") -App $app -TargetFolder $targetFolder -StorageAccountName $StorageAccountName -ResourceGroupName $ResourceGroupName
}

Write-Host "`nAll deployments complete!" -ForegroundColor Green
